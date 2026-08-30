import { useEffect, useMemo, useState } from "react";
import PageShell from "./PageShell.jsx";
import { fetchCourses, fetchCourseSchedules, resolveImageUrl } from "./data/coursesApi.js";
import { useAuth } from "./auth/AuthContext.jsx";
import * as authApi from "./data/authApi.js";
import CountryPickerInput from "./components/CountryPickerInput.jsx";

function getCourseIdFromUrl() {
  return new URLSearchParams(window.location.search).get("courseId") || "";
}

function getModeFromUrl() {
  return new URLSearchParams(window.location.search).get("mode") === "login" ? "login" : "register";
}

// Step indicator shown at the top of the multi-step flow. Account comes
// first (registering/logging in no longer depends on picking a course),
// then courses (optional — a visitor can skip straight to submission with
// zero picked), then schedules/payment only when relevant.
const STEP_ORDER = ["account", "courses", "schedules", "payment"];
const STEP_LABELS = {
  account: "Your Account",
  courses: "Select Courses",
  schedules: "Choose Batches",
  payment: "Payment",
};

function StepIndicator({ step, includeSchedules, includePayment }) {
  const steps = STEP_ORDER.filter((s) => {
    if (s === "schedules") return includeSchedules;
    if (s === "payment") return includePayment;
    return true;
  });
  const currentIndex = steps.indexOf(step);
  if (currentIndex === -1) return null;
  return (
    <ol className="register-page__steps">
      {steps.map((s, i) => (
        <li
          key={s}
          className={
            i === currentIndex
              ? "is-current"
              : i < currentIndex
                ? "is-done"
                : ""
          }
        >
          <span className="register-page__step-num">{i + 1}</span>
          <span className="register-page__step-label">{STEP_LABELS[s]}</span>
        </li>
      ))}
    </ol>
  );
}

// Left-column "your registration" summary shown alongside the courses,
// schedules, and payment steps — gives the visitor context on the account
// they just created/logged into and (once relevant) which courses/batches
// they've picked, while the actual step content sits in the right column.
function RegistrationSummaryPanel({ auth, step, selectedCourses, totalsByCurrency, scheduleLabelFor, pendingName, pendingEmail }) {
  const showCourses = (step === "schedules" || step === "payment") && selectedCourses.length > 0;
  return (
    <div className="register-page__summary">
      <h2 className="display register-page__summary-title">Your Registration</h2>

      {auth.user ? (
        <div className="register-page__summary-account">
          <span className="register-page__summary-name">{auth.user.fullName}</span>
          <span className="register-page__summary-email">{auth.user.email}</span>
          <button
            type="button"
            className="register-page__summary-logout"
            onClick={async () => {
              await auth.logout();
              window.location.reload();
            }}
          >
            Not you? Log out
          </button>
        </div>
      ) : (
        // No account exists yet at this point — creation is deferred until
        // the visitor finishes (skips courses or completes payment). Show
        // what's actually known so far: the details just entered on step 1.
        <div className="register-page__summary-account">
          <span className="register-page__summary-name">{pendingName || "Your details"}</span>
          <span className="register-page__summary-email">
            {pendingEmail ? `${pendingEmail} — account will be created when you finish.` : "Account will be created when you finish."}
          </span>
        </div>
      )}

      {showCourses && (
        <div className="register-page__summary-courses">
          <h4>Selected courses</h4>
          <ul className="register-page__summary-course-list">
            {selectedCourses.map((c) => {
              const batchName = scheduleLabelFor ? scheduleLabelFor(c.courseID) : null;
              return (
                <li key={c.courseID}>
                  <span>
                    {c.courseTitle}
                    {batchName ? ` (${batchName})` : ""}
                  </span>
                  <span className="register-page__course-fee">
                    {c.fee ? `${c.currencyCode} ${Number(c.fee).toLocaleString()}` : "—"}
                  </span>
                </li>
              );
            })}
          </ul>
          {Object.entries(totalsByCurrency).map(([currency, total]) => (
            <div className="register-page__summary-total" key={currency || "unspecified"}>
              <span>Total{currency ? ` (${currency})` : ""}</span>
              <span>{total.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Standalone registration page — replaces the old AuthModal popup flow.
// Visitors create an account (or log in) first, then OPTIONALLY browse the
// course catalog and select courses (a ?courseId= query param can
// pre-select one, e.g. arriving from a course's detail page), pick a
// batch/schedule for each selected course that has one, then optionally
// declare a payment (Cash or Bank Deposit + slip) before a final confirm.
//
// Steps: 'account' (create account or log in) -> 'courses' (optional; a
// "Skip for now" path is always available) -> 'schedules' (skipped if no
// selected course has schedules, or if no course was selected) ->
// 'payment' (skipped if no course was selected) -> 'confirm'.
//
// Payment, like the admin-side wizard, only ever applies to the FIRST
// selected course when several are chosen in one go — see
// authApi.registerNew/registerForCourse and the payment step's help text.
export default function RegisterPage() {
  const auth = useAuth();

  // ?mode=login (e.g. from the site nav's "Log in" link) opens straight into
  // the login form.
  const [step, setStep] = useState("account"); // 'account' | 'courses' | 'schedules' | 'payment' | 'confirm'

  const [courses, setCourses] = useState(null);
  const [coursesError, setCoursesError] = useState(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState(() => {
    const preselect = getCourseIdFromUrl();
    return preselect ? [preselect] : [];
  });
  const [showSelectHint, setShowSelectHint] = useState(false);

  // Schedules per selected course, fetched when entering the 'schedules'
  // step: { [courseId]: CourseSchedule[] | null (loading) }. A course with
  // an empty array simply has no batches to pick and is skipped in the UI.
  const [schedulesByCourse, setSchedulesByCourse] = useState({});
  const [schedulesError, setSchedulesError] = useState(null);
  const [courseScheduleSelections, setCourseScheduleSelections] = useState({}); // { [courseId]: scheduleId }
  const [showScheduleHint, setShowScheduleHint] = useState(false);

  const [authMode, setAuthMode] = useState(() => getModeFromUrl()); // "register" | "login"
  // Mirrors StudentRegistrationRequest's full field list (see
  // Areas/Admin/Models/Student.cs) so the public account step can collect
  // the same detail the admin wizard does. Only first/last/email stay
  // `required` here — everything else is optional on both the model and
  // this form, matching StudentRegistrationRequest's lack of [Required]
  // attributes beyond name/email (those live on the separate, admin-only
  // StudentFormViewModel instead).
  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    country: "",
    passportNumber: "",
    passportCountry: "",
    passportExpiryDate: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyRelationship: "",
  });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  // Payment step state. Once a course is selected, a payment method + amount
  // is required (see handlePaymentContinue) — "" only ever appears transiently
  // before the visitor has picked Cash or Bank Deposit.
  const [paymentMethod, setPaymentMethod] = useState(""); // "" | "Cash" | "BankDeposit"
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentSlipFile, setPaymentSlipFile] = useState(null);
  const [showPaymentHint, setShowPaymentHint] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // { titles: string[], perCourse: {id: "ok"|"already"|message}, payment: {...}|null } | null

  useEffect(() => {
    let cancelled = false;
    fetchCourses()
      .then((data) => { if (!cancelled) setCourses(data); })
      .catch((err) => { if (!cancelled) setCoursesError(err.message); });
    return () => { cancelled = true; };
  }, []);

  const selectedCourses = useMemo(
    () => (courses || []).filter((c) => selectedCourseIds.includes(c.courseID)),
    [courses, selectedCourseIds]
  );

  // Courses (among the selected ones) that actually have schedules loaded —
  // used both to render pickers and to decide whether the schedule step
  // should be shown at all.
  const coursesWithSchedules = useMemo(
    () => selectedCourses.filter((c) => (schedulesByCourse[c.courseID] || []).length > 0),
    [selectedCourses, schedulesByCourse]
  );

  const totalsByCurrency = useMemo(() => {
    const totals = {};
    for (const c of selectedCourses) {
      const currency = c.currencyCode || "";
      const fee = Number(c.fee) || 0;
      totals[currency] = (totals[currency] || 0) + fee;
    }
    return totals;
  }, [selectedCourses]);

  // The course the payment step (and its help text) applies to — always the
  // first selected course, mirroring the admin wizard's simplification.
  const firstSelectedCourse = selectedCourses[0] || null;

  function toggleCourse(courseId) {
    setShowSelectHint(false);
    setSelectedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  }

  function updateRegisterField(field, value) {
    setRegisterForm((f) => ({ ...f, [field]: value }));
  }

  // Builds the account-detail portion of the register-new payload from
  // registerForm — shared by the account step's own submit (zero courses)
  // and the later finalizeRegistration path (courses/schedules/payment
  // already chosen). No `Password` field: the backend auto-generates one
  // and emails it to the visitor.
  function buildAccountPayload() {
    return {
      FirstName: registerForm.firstName,
      LastName: registerForm.lastName,
      Email: registerForm.email,
      Phone: registerForm.phone,
      DateOfBirth: registerForm.dateOfBirth || null,
      Gender: registerForm.gender,
      Nationality: registerForm.nationality,
      AddressLine1: registerForm.addressLine1,
      AddressLine2: registerForm.addressLine2,
      City: registerForm.city,
      StateProvince: registerForm.stateProvince,
      PostalCode: registerForm.postalCode,
      Country: registerForm.country,
      PassportNumber: registerForm.passportNumber,
      PassportCountry: registerForm.passportCountry,
      PassportExpiryDate: registerForm.passportExpiryDate || null,
      EmergencyContactName: registerForm.emergencyContactName,
      EmergencyContactPhone: registerForm.emergencyContactPhone,
      EmergencyRelationship: registerForm.emergencyRelationship,
    };
  }

  function updateLoginField(field, value) {
    setLoginForm((f) => ({ ...f, [field]: value }));
  }

  function selectSchedule(courseId, scheduleId) {
    setShowScheduleHint(false);
    setCourseScheduleSelections((prev) => ({ ...prev, [courseId]: scheduleId }));
  }

  // Advances from the account step once logged in/registered-with-no-courses
  // isn't the path — this is only reachable once auth.user is set, since the
  // account step's own form submit handles login/register directly.
  function goToCoursesStep() {
    setError(null);
    setStep("courses");
  }

  // Explicit, first-class "skip courses" action — jumps straight past
  // schedules/payment to final submission with zero courses selected.
  async function handleSkipCourses() {
    setSelectedCourseIds([]);
    await finalizeRegistration([]);
  }

  // Advances from course selection to the schedule step (or straight to
  // payment/submission if none of the selected courses have schedules, or
  // straight to submission if zero courses were selected).
  async function handleContinueFromCourses() {
    if (selectedCourseIds.length === 0) {
      await finalizeRegistration([]);
      return;
    }
    setError(null);
    setSchedulesError(null);
    try {
      const entries = await Promise.all(
        selectedCourseIds.map(async (courseId) => {
          if (schedulesByCourse[courseId]) return [courseId, schedulesByCourse[courseId]];
          const list = await fetchCourseSchedules(courseId);
          return [courseId, list];
        })
      );
      const next = { ...schedulesByCourse, ...Object.fromEntries(entries) };
      setSchedulesByCourse(next);

      const anyHaveSchedules = selectedCourseIds.some((id) => (next[id] || []).length > 0);
      setStep(anyHaveSchedules ? "schedules" : "payment");
    } catch (err) {
      setSchedulesError(err.message);
    }
  }

  function handleContinueFromSchedules() {
    const missing = coursesWithSchedules.some((c) => !courseScheduleSelections[c.courseID]);
    if (missing) {
      setShowScheduleHint(true);
      return;
    }
    setStep("payment");
  }

  // The payment step is only ever shown when at least one course was
  // selected (see includePayment/step rendering below) — and once shown,
  // a payment method + a positive amount are both mandatory. There's no
  // more "no payment right now" escape hatch in that case.
  const paymentAmountNumber = Number(paymentAmount) || 0;
  const paymentIsValid =
    (paymentMethod === "Cash" || paymentMethod === "BankDeposit") && paymentAmountNumber > 0;

  // Enrolls in every selected course, one call at a time, tolerating a 409
  // ("already registered") as a soft success rather than a hard failure.
  // Only the FIRST course (if any) carries the declared payment — mirrors
  // register-new's same simplification for the already-logged-in path.
  async function enrollInSelectedCourses(courseIds) {
    const perCourse = {};
    for (let i = 0; i < courseIds.length; i++) {
      const courseId = courseIds[i];
      try {
        const payment =
          i === 0 && paymentMethod
            ? { method: paymentMethod, amount: Number(paymentAmount) || 0, notes: paymentNotes }
            : null;
        const res = await authApi.registerForCourse(courseId, courseScheduleSelections[courseId] || "", payment);
        if (i === 0 && paymentMethod === "BankDeposit" && paymentSlipFile && res?.registrationId) {
          await authApi.submitRegistrationPayment(res.registrationId, {
            method: paymentMethod,
            amount: Number(paymentAmount) || 0,
            notes: paymentNotes,
            slipFile: paymentSlipFile,
          });
        }
        perCourse[courseId] = "ok";
      } catch (err) {
        const message = err.message || "";
        perCourse[courseId] = /already registered/i.test(message) ? "already" : message;
      }
    }
    return perCourse;
  }

  // Shared submission path for both "Skip for now" (zero courses) and the
  // normal course/schedule/payment flow's final step — registers the
  // account (or enrolls, if already logged in) and lands on 'confirm'.
  async function finalizeRegistration(courseIds) {
    setError(null);
    setSubmitting(true);
    try {
      if (auth.user) {
        const perCourse = courseIds.length > 0 ? await enrollInSelectedCourses(courseIds) : null;
        setResult({
          titles: selectedCourses.map((c) => c.courseTitle),
          perCourse,
          loggedInOnly: courseIds.length === 0,
          payment: courseIds.length > 0 && paymentMethod ? { method: paymentMethod, amount: Number(paymentAmount) || 0 } : null,
        });
      } else {
        const payload = {
          ...buildAccountPayload(),
          CourseIDs: courseIds,
          CourseScheduleSelections: courseScheduleSelections,
          PaymentMethod: courseIds.length > 0 ? paymentMethod : "",
          InitialPaymentAmount: courseIds.length > 0 ? Number(paymentAmount) || 0 : 0,
          PaymentNotes: courseIds.length > 0 ? paymentNotes : "",
        };
        const regResult = await auth.registerNew(payload);

        // Attach the slip file (if any) in a follow-up call — register-new
        // is JSON and can't carry a multipart file itself.
        if (courseIds.length > 0 && paymentMethod === "BankDeposit" && paymentSlipFile && regResult?.firstRegistrationId) {
          try {
            await authApi.submitRegistrationPayment(regResult.firstRegistrationId, {
              method: paymentMethod,
              amount: Number(paymentAmount) || 0,
              notes: paymentNotes,
              slipFile: paymentSlipFile,
            });
          } catch {
            // Registration itself already succeeded; a slip-upload hiccup
            // shouldn't block confirmation — the team can request it again.
          }
        }

        setResult({
          titles: selectedCourses.map((c) => c.courseTitle),
          perCourse: null,
          payment: courseIds.length > 0 && paymentMethod ? { method: paymentMethod, amount: Number(paymentAmount) || 0 } : null,
        });
      }
      setStep("confirm");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAccountSubmit(e) {
    e.preventDefault();
    setError(null);
    if (authMode === "register") {
      // Deliberately no network call here: creating the account is deferred
      // to finalizeRegistration (either via "Skip for now" with zero
      // courses, or after the payment step), so a visitor who fills this
      // form in and then abandons the flow never leaves behind an orphaned
      // account. registerForm already holds every field via
      // updateRegisterField/component state, so nothing else needs saving —
      // just move on to course selection.
      setStep("courses");
      return;
    }
    // Logging into an EXISTING account doesn't create any new data, so it
    // still happens immediately here, unchanged.
    setSubmitting(true);
    try {
      await auth.login(loginForm.email, loginForm.password);
      setStep("courses");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePaymentContinue(e) {
    e.preventDefault();
    if (!paymentIsValid) {
      setShowPaymentHint(true);
      return;
    }
    await finalizeRegistration(selectedCourseIds);
  }

  function scheduleLabelFor(courseId) {
    const scheduleId = courseScheduleSelections[courseId];
    if (!scheduleId) return null;
    const schedule = (schedulesByCourse[courseId] || []).find((s) => s.scheduleID === scheduleId);
    return schedule ? schedule.scheduleName : null;
  }

  if (result) {
    return (
      <PageShell>
        <main className="page-main register-page">
          <section className="register-page__hero">
            <div className="container">
              <p className="eyebrow">Registration</p>
              <h1 className="display register-page__title">
                {result.loggedInOnly ? "You&rsquo;re logged in" : "You&rsquo;re all set"}
              </h1>
            </div>
          </section>
          <section className="register-page__body">
            <div className="container register-page__confirm">
              {result.loggedInOnly || selectedCourses.length === 0 ? (
                <>
                  <p className="register-page__confirm-lede">
                    Your account is all set{auth.user ? <> — welcome, <strong>{auth.user.fullName}</strong></> : ""}.
                    You didn&rsquo;t select any courses yet — no problem, you can browse the catalog and
                    register whenever you&rsquo;re ready.
                  </p>
                  <a href="/services/courses.html" className="btn btn--ink">
                    <span>Browse Courses</span>
                  </a>
                </>
              ) : (
                <>
                  <p className="register-page__confirm-lede">
                    You&rsquo;re registered for: <strong>{result.titles.join(", ") || "—"}</strong>.
                  </p>
                  {result.payment && result.payment.method ? (
                    <p className="register-page__confirm-lede">
                      We&rsquo;ve noted your {result.payment.method === "BankDeposit" ? "Bank Deposit" : "Cash"} payment
                      {result.payment.amount ? ` of ${result.payment.amount.toLocaleString()}` : ""} — our team will
                      verify it shortly.
                    </p>
                  ) : (
                    <p className="register-page__confirm-lede">
                      No payment was declared yet — that&rsquo;s fine, our team will follow up, or you can arrange
                      payment from your account at any time.
                    </p>
                  )}
                  <ul className="register-page__confirm-list">
                    {selectedCourses.map((c) => {
                      const status = result.perCourse ? result.perCourse[c.courseID] : null;
                      const batchName = scheduleLabelFor(c.courseID);
                      return (
                        <li key={c.courseID}>
                          <span>
                            {c.courseTitle}
                            {batchName ? ` (Batch: ${batchName})` : ""}
                          </span>
                          {result.perCourse && (
                            <span className={status === "ok" || status === "already" ? "is-ok" : "is-error"}>
                              {status === "ok" ? "Registered" : status === "already" ? "Already registered" : status}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  <a href="/services/courses.html" className="btn btn--ink">
                    <span>Back to Courses</span>
                  </a>
                </>
              )}
            </div>
          </section>
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main className="page-main register-page">
        <section className="register-page__hero">
          <div className="container">
            <p className="eyebrow">Registration</p>
            <h1 className="display register-page__title">Register for courses</h1>
            <p className="lede register-page__desc">
              Create your account first — then, if you&rsquo;d like, select courses, choose a batch, and
              let us know how you plan to pay. Every step after your account is optional.
            </p>

            {!auth.loading && auth.user && (
              <p className="register-page__banner">
                Logged in as <strong>{auth.user.fullName}</strong>.{" "}
                <button
                  type="button"
                  onClick={async () => {
                    await auth.logout();
                    window.location.reload();
                  }}
                >
                  Log out
                </button>
              </p>
            )}
            {!auth.loading && !auth.user && step === "account" && (
              <p className="register-page__banner register-page__banner--muted">
                {authMode === "register" ? (
                  <>
                    Already have an account?{" "}
                    <button type="button" onClick={() => { setAuthMode("login"); setError(null); }}>Log in</button>
                  </>
                ) : (
                  <>
                    Need an account?{" "}
                    <button type="button" onClick={() => { setAuthMode("register"); setError(null); }}>Register instead</button>
                  </>
                )}
              </p>
            )}

            {step !== "confirm" && (
              <StepIndicator
                step={step}
                includeSchedules={coursesWithSchedules.length > 0 || step === "schedules"}
                includePayment={selectedCourseIds.length > 0 || step === "payment"}
              />
            )}
          </div>
        </section>

        {step === "account" && (
          <section className="register-page__body">
            <div className="container register-page__account-standalone">
              <div className="register-page__account">
                <h2 className="display register-page__section-title">
                  {auth.user ? "You're logged in" : authMode === "register" ? "1. Create your account" : "Log in"}
                </h2>

                {error && <p className="register-page__error">{error}</p>}

                {auth.user ? (
                  <div className="register-page__form">
                    <p className="register-page__logged-in">
                      You&rsquo;re logged in as <strong>{auth.user.fullName}</strong>.
                    </p>
                    <button type="button" className="btn btn--ink register-page__submit" onClick={goToCoursesStep}>
                      <span>Continue</span>
                    </button>
                  </div>
                ) : authMode === "register" ? (
                  <form className="register-page__form" onSubmit={handleAccountSubmit}>
                    <div className="register-page__row">
                      <div className="register-page__field">
                        <label htmlFor="reg-first-name">First name</label>
                        <input
                          id="reg-first-name"
                          type="text"
                          required
                          value={registerForm.firstName}
                          onChange={(e) => updateRegisterField("firstName", e.target.value)}
                        />
                      </div>
                      <div className="register-page__field">
                        <label htmlFor="reg-last-name">Last name</label>
                        <input
                          id="reg-last-name"
                          type="text"
                          required
                          value={registerForm.lastName}
                          onChange={(e) => updateRegisterField("lastName", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="register-page__field">
                      <label htmlFor="reg-email">Email</label>
                      <input
                        id="reg-email"
                        type="email"
                        required
                        value={registerForm.email}
                        onChange={(e) => updateRegisterField("email", e.target.value)}
                      />
                    </div>
                    <div className="register-page__field">
                      <label htmlFor="reg-phone">Phone (optional)</label>
                      <input
                        id="reg-phone"
                        type="tel"
                        value={registerForm.phone}
                        onChange={(e) => updateRegisterField("phone", e.target.value)}
                      />
                    </div>

                    <h3 className="register-page__group-title">Personal</h3>
                    <div className="register-page__row">
                      <div className="register-page__field">
                        <label htmlFor="reg-dob">Date of birth (optional)</label>
                        <input
                          id="reg-dob"
                          type="date"
                          value={registerForm.dateOfBirth}
                          onChange={(e) => updateRegisterField("dateOfBirth", e.target.value)}
                        />
                      </div>
                      <div className="register-page__field">
                        <label htmlFor="reg-gender">Gender (optional)</label>
                        <select
                          id="reg-gender"
                          value={registerForm.gender}
                          onChange={(e) => updateRegisterField("gender", e.target.value)}
                        >
                          <option value="">Select…</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <CountryPickerInput
                      id="reg-nationality"
                      label="Nationality (optional)"
                      mode="nationality"
                      value={registerForm.nationality}
                      onChange={(value) => updateRegisterField("nationality", value)}
                    />

                    <h3 className="register-page__group-title">Address (optional)</h3>
                    <div className="register-page__field">
                      <label htmlFor="reg-address1">Address line 1</label>
                      <input
                        id="reg-address1"
                        type="text"
                        value={registerForm.addressLine1}
                        onChange={(e) => updateRegisterField("addressLine1", e.target.value)}
                      />
                    </div>
                    <div className="register-page__field">
                      <label htmlFor="reg-address2">Address line 2</label>
                      <input
                        id="reg-address2"
                        type="text"
                        value={registerForm.addressLine2}
                        onChange={(e) => updateRegisterField("addressLine2", e.target.value)}
                      />
                    </div>
                    <div className="register-page__row">
                      <div className="register-page__field">
                        <label htmlFor="reg-city">City</label>
                        <input
                          id="reg-city"
                          type="text"
                          value={registerForm.city}
                          onChange={(e) => updateRegisterField("city", e.target.value)}
                        />
                      </div>
                      <div className="register-page__field">
                        <label htmlFor="reg-state">State / Province</label>
                        <input
                          id="reg-state"
                          type="text"
                          value={registerForm.stateProvince}
                          onChange={(e) => updateRegisterField("stateProvince", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="register-page__row">
                      <div className="register-page__field">
                        <label htmlFor="reg-postal">Postal code</label>
                        <input
                          id="reg-postal"
                          type="text"
                          value={registerForm.postalCode}
                          onChange={(e) => updateRegisterField("postalCode", e.target.value)}
                        />
                      </div>
                      <CountryPickerInput
                        id="reg-country"
                        label="Country"
                        mode="country"
                        value={registerForm.country}
                        onChange={(value) => updateRegisterField("country", value)}
                      />
                    </div>

                    <h3 className="register-page__group-title">Passport (optional)</h3>
                    <div className="register-page__row">
                      <div className="register-page__field">
                        <label htmlFor="reg-passport-number">Passport number</label>
                        <input
                          id="reg-passport-number"
                          type="text"
                          value={registerForm.passportNumber}
                          onChange={(e) => updateRegisterField("passportNumber", e.target.value)}
                        />
                      </div>
                      <CountryPickerInput
                        id="reg-passport-country"
                        label="Passport country"
                        mode="country"
                        value={registerForm.passportCountry}
                        onChange={(value) => updateRegisterField("passportCountry", value)}
                      />
                    </div>
                    <div className="register-page__field">
                      <label htmlFor="reg-passport-expiry">Passport expiry date</label>
                      <input
                        id="reg-passport-expiry"
                        type="date"
                        value={registerForm.passportExpiryDate}
                        onChange={(e) => updateRegisterField("passportExpiryDate", e.target.value)}
                      />
                    </div>

                    <h3 className="register-page__group-title">Emergency Contact (optional)</h3>
                    <div className="register-page__row">
                      <div className="register-page__field">
                        <label htmlFor="reg-emergency-name">Name</label>
                        <input
                          id="reg-emergency-name"
                          type="text"
                          value={registerForm.emergencyContactName}
                          onChange={(e) => updateRegisterField("emergencyContactName", e.target.value)}
                        />
                      </div>
                      <div className="register-page__field">
                        <label htmlFor="reg-emergency-phone">Phone</label>
                        <input
                          id="reg-emergency-phone"
                          type="tel"
                          value={registerForm.emergencyContactPhone}
                          onChange={(e) => updateRegisterField("emergencyContactPhone", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="register-page__field">
                      <label htmlFor="reg-emergency-relationship">Relationship</label>
                      <input
                        id="reg-emergency-relationship"
                        type="text"
                        value={registerForm.emergencyRelationship}
                        onChange={(e) => updateRegisterField("emergencyRelationship", e.target.value)}
                      />
                    </div>

                    <p className="register-page__note">
                      We&rsquo;ll email your login details (including a temporary password) to the address above.
                    </p>
                    <button
                      type="submit"
                      className="btn btn--ink register-page__submit"
                      disabled={submitting}
                    >
                      <span>{submitting ? "Please wait…" : "Continue"}</span>
                    </button>

                    <p className="register-page__toggle">
                      Already have an account?{" "}
                      <button type="button" onClick={() => { setAuthMode("login"); setError(null); }}>
                        Log in instead
                      </button>
                    </p>
                  </form>
                ) : (
                  <form className="register-page__form" onSubmit={handleAccountSubmit}>
                    <div className="register-page__field">
                      <label htmlFor="login-email">Email</label>
                      <input
                        id="login-email"
                        type="email"
                        required
                        value={loginForm.email}
                        onChange={(e) => updateLoginField("email", e.target.value)}
                      />
                    </div>
                    <div className="register-page__field">
                      <label htmlFor="login-password">Password</label>
                      <input
                        id="login-password"
                        type="password"
                        required
                        value={loginForm.password}
                        onChange={(e) => updateLoginField("password", e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn--ink register-page__submit"
                      disabled={submitting}
                    >
                      <span>{submitting ? "Logging in…" : "Log in & continue"}</span>
                    </button>

                    <p className="register-page__toggle">
                      Need an account?{" "}
                      <button type="button" onClick={() => { setAuthMode("register"); setError(null); }}>
                        Register instead
                      </button>
                    </p>
                  </form>
                )}
              </div>
            </div>
          </section>
        )}

        {(step === "courses" || step === "schedules" || step === "payment") && (
        <section className="register-page__body">
          <div className="container register-page__grid">
            <RegistrationSummaryPanel
              auth={auth}
              step={step}
              selectedCourses={selectedCourses}
              totalsByCurrency={totalsByCurrency}
              scheduleLabelFor={scheduleLabelFor}
              pendingName={[registerForm.firstName, registerForm.lastName].filter(Boolean).join(" ")}
              pendingEmail={registerForm.email}
            />

            {step === "courses" && (
              <div className="register-page__courses">
                <h2 className="display register-page__section-title">2. Select courses (optional)</h2>
                <p className="register-page__desc">
                  Pick any courses you&rsquo;d like to register for now, or skip this — you can always add
                  courses later from your account.
                </p>

                {coursesError && <p className="register-page__status">{coursesError}</p>}
                {!coursesError && !courses && <p className="register-page__status">Loading courses…</p>}
                {!coursesError && courses && courses.length === 0 && (
                  <p className="register-page__status">No courses available right now.</p>
                )}

                <div className="register-page__course-list">
                  {(courses || []).map((c) => {
                    const checked = selectedCourseIds.includes(c.courseID);
                    const isCSCA = c.courseType === "CSCA";
                    return (
                      <label
                        key={c.courseID}
                        className={`register-page__course-card ${checked ? "is-selected" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCourse(c.courseID)}
                        />
                        {c.courseImageURL ? (
                          <img
                            className="register-page__course-thumb"
                            src={resolveImageUrl(c.courseImageURL)}
                            alt=""
                          />
                        ) : (
                          <div className="register-page__course-thumb register-page__course-thumb--placeholder" />
                        )}
                        <div className="register-page__course-info">
                          <span className={`register-page__course-type ${isCSCA ? "is-csca" : "is-general"}`}>
                            {c.courseType}
                          </span>
                          <h3>{c.courseTitle}</h3>
                          {c.fee ? (
                            <span className="register-page__course-fee">
                              {c.currencyCode} {Number(c.fee).toLocaleString()}
                            </span>
                          ) : (
                            <span className="register-page__course-fee">Fee on request</span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>

                {selectedCourseIds.length > 0 && (
                  <div className="register-page__totals">
                    <span>Selected: {selectedCourseIds.length}</span>
                    {Object.entries(totalsByCurrency).map(([currency, total]) => (
                      <span key={currency || "unspecified"}>
                        Total{currency ? ` (${currency})` : ""}: {total.toLocaleString()}
                      </span>
                    ))}
                  </div>
                )}

                {showSelectHint && (
                  <p className="register-page__hint">Select at least one course, or use "Skip for now".</p>
                )}
                {schedulesError && <p className="register-page__error">{schedulesError}</p>}
                {error && <p className="register-page__error">{error}</p>}

                <div className="register-page__step-actions register-page__step-actions--three">
                  <button
                    type="button"
                    className="btn btn--ink register-page__back"
                    onClick={handleSkipCourses}
                    disabled={submitting}
                  >
                    <span>{submitting ? "Please wait…" : "Skip for now"}</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn--ink register-page__submit"
                    onClick={handleContinueFromCourses}
                    disabled={submitting}
                  >
                    <span>{selectedCourseIds.length > 0 ? "Continue" : "Continue without courses"}</span>
                  </button>
                </div>
              </div>
            )}

            {step === "schedules" && (
              <div className="register-page__courses">
                <h2 className="display register-page__section-title">3. Choose your batch</h2>
                <p className="register-page__desc">
                  Pick a batch for each course below. Courses with no scheduled batches yet can skip this step.
                </p>

                <div className="register-page__course-list">
                  {coursesWithSchedules.map((c) => {
                    const schedules = schedulesByCourse[c.courseID] || [];
                    return (
                      <div key={c.courseID} className="register-page__course-card register-page__schedule-card">
                        <div className="register-page__course-info">
                          <h3>{c.courseTitle}</h3>
                          <div className="register-page__schedule-options">
                            {schedules.map((s) => (
                              <label key={s.scheduleID} className="register-page__schedule-option">
                                <input
                                  type="radio"
                                  name={`schedule-${c.courseID}`}
                                  checked={courseScheduleSelections[c.courseID] === s.scheduleID}
                                  onChange={() => selectSchedule(c.courseID, s.scheduleID)}
                                />
                                <span>
                                  <strong>{s.scheduleName || "Batch"}</strong>
                                  {s.segmentsSummary ? ` — ${s.segmentsSummary}` : ""}
                                  {s.location ? ` (${s.location})` : ""}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {showScheduleHint && (
                  <p className="register-page__hint">Please pick a batch for each course listed above.</p>
                )}

                <div className="register-page__step-actions">
                  <button
                    type="button"
                    className="btn btn--ink register-page__back"
                    onClick={() => setStep("courses")}
                  >
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn--ink register-page__submit"
                    onClick={handleContinueFromSchedules}
                  >
                    <span>Next</span>
                  </button>
                </div>
              </div>
            )}

            {step === "payment" && (
              <div className="register-page__account">
                <h2 className="display register-page__section-title">
                  {coursesWithSchedules.length > 0 ? "4." : "3."} Payment
                </h2>

                {error && <p className="register-page__error">{error}</p>}

                <form className="register-page__form" onSubmit={handlePaymentContinue}>
                  <p className="register-page__desc">
                    Let us know how you&rsquo;re paying so our team can confirm your enrollment.
                    {selectedCourses.length > 1 && firstSelectedCourse && (
                      <>
                        {" "}
                        Since you selected more than one course, this payment is recorded only against{" "}
                        <strong>{firstSelectedCourse.courseTitle}</strong>; you can record payments for your
                        other courses afterward from your account.
                      </>
                    )}
                  </p>

                  <div className="register-page__field">
                    <label>Payment method</label>
                    <div className="register-page__payment-methods">
                      <label
                        className={`register-page__payment-method-option ${paymentMethod === "Cash" ? "is-selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name="payment-method"
                          checked={paymentMethod === "Cash"}
                          onChange={() => { setPaymentMethod("Cash"); setShowPaymentHint(false); }}
                        />
                        <span>Cash</span>
                      </label>
                      <label
                        className={`register-page__payment-method-option ${paymentMethod === "BankDeposit" ? "is-selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name="payment-method"
                          checked={paymentMethod === "BankDeposit"}
                          onChange={() => { setPaymentMethod("BankDeposit"); setShowPaymentHint(false); }}
                        />
                        <span>Bank Deposit</span>
                      </label>
                    </div>
                  </div>

                  {paymentMethod && (
                    <>
                      <div className="register-page__field">
                        <label htmlFor="payment-amount">Amount</label>
                        <input
                          id="payment-amount"
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={paymentAmount}
                          onChange={(e) => { setPaymentAmount(e.target.value); setShowPaymentHint(false); }}
                        />
                      </div>
                      {paymentMethod === "BankDeposit" && (
                        <div className="register-page__field">
                          <label htmlFor="payment-slip">Deposit slip (recommended)</label>
                          <input
                            id="payment-slip"
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => setPaymentSlipFile(e.target.files?.[0] || null)}
                          />
                        </div>
                      )}
                      <div className="register-page__field">
                        <label htmlFor="payment-notes">Notes (optional)</label>
                        <input
                          id="payment-notes"
                          type="text"
                          value={paymentNotes}
                          onChange={(e) => setPaymentNotes(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {showPaymentHint && (
                    <p className="register-page__hint">
                      Choose a payment method and enter an amount greater than 0 to finish registration.
                    </p>
                  )}

                  <div className="register-page__step-actions">
                    <button
                      type="button"
                      className="btn btn--ink register-page__back"
                      onClick={() => setStep(coursesWithSchedules.length > 0 ? "schedules" : "courses")}
                    >
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      className="btn btn--ink register-page__submit"
                      disabled={submitting}
                    >
                      <span>{submitting ? "Finishing…" : "Finish registration"}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </section>
        )}
      </main>
    </PageShell>
  );
}
