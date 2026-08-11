import PageShell from "./PageShell.jsx";
import About from "./components/About.jsx";

export default function AboutPage() {
  return (
    <PageShell>
      <main className="page-main about-page">
        <About />
      </main>
    </PageShell>
  );
}
