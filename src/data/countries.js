// Country + nationality dataset for the searchable, flag-annotated picker
// used on the public registration form. Ported verbatim from the admin
// side's vanilla-JS widget (backend/Web_Backend/wwwroot/js/country-picker.js)
// so both sides show the exact same list. Each row is
// [ISO-3166 alpha-2, country name, nationality/demonym].
//
// Flags are rendered from real SVG assets (copied from the same source as
// the admin side, served from frontend/public/img/flags/*.svg) rather than
// Unicode regional-indicator emoji, since Windows/Chrome frequently renders
// those emoji as plain two-letter tiles instead of an actual flag.
const countriesData = [
  ["AF", "Afghanistan", "Afghan"], ["AL", "Albania", "Albanian"], ["DZ", "Algeria", "Algerian"],
  ["AD", "Andorra", "Andorran"], ["AO", "Angola", "Angolan"], ["AG", "Antigua and Barbuda", "Antiguan"],
  ["AR", "Argentina", "Argentine"], ["AM", "Armenia", "Armenian"], ["AU", "Australia", "Australian"],
  ["AT", "Austria", "Austrian"], ["AZ", "Azerbaijan", "Azerbaijani"], ["BS", "Bahamas", "Bahamian"],
  ["BH", "Bahrain", "Bahraini"], ["BD", "Bangladesh", "Bangladeshi"], ["BB", "Barbados", "Barbadian"],
  ["BY", "Belarus", "Belarusian"], ["BE", "Belgium", "Belgian"], ["BZ", "Belize", "Belizean"],
  ["BJ", "Benin", "Beninese"], ["BT", "Bhutan", "Bhutanese"], ["BO", "Bolivia", "Bolivian"],
  ["BA", "Bosnia and Herzegovina", "Bosnian"], ["BW", "Botswana", "Botswanan"], ["BR", "Brazil", "Brazilian"],
  ["BN", "Brunei", "Bruneian"], ["BG", "Bulgaria", "Bulgarian"], ["BF", "Burkina Faso", "Burkinabe"],
  ["BI", "Burundi", "Burundian"], ["KH", "Cambodia", "Cambodian"], ["CM", "Cameroon", "Cameroonian"],
  ["CA", "Canada", "Canadian"], ["CV", "Cape Verde", "Cape Verdean"], ["CF", "Central African Republic", "Central African"],
  ["TD", "Chad", "Chadian"], ["CL", "Chile", "Chilean"], ["CN", "China", "Chinese"],
  ["CO", "Colombia", "Colombian"], ["KM", "Comoros", "Comoran"], ["CG", "Congo", "Congolese"],
  ["CR", "Costa Rica", "Costa Rican"], ["HR", "Croatia", "Croatian"], ["CU", "Cuba", "Cuban"],
  ["CY", "Cyprus", "Cypriot"], ["CZ", "Czech Republic", "Czech"], ["DK", "Denmark", "Danish"],
  ["DJ", "Djibouti", "Djiboutian"], ["DM", "Dominica", "Dominican"], ["DO", "Dominican Republic", "Dominican"],
  ["EC", "Ecuador", "Ecuadorian"], ["EG", "Egypt", "Egyptian"], ["SV", "El Salvador", "Salvadoran"],
  ["GQ", "Equatorial Guinea", "Equatorial Guinean"], ["ER", "Eritrea", "Eritrean"], ["EE", "Estonia", "Estonian"],
  ["SZ", "Eswatini", "Swazi"], ["ET", "Ethiopia", "Ethiopian"], ["FJ", "Fiji", "Fijian"],
  ["FI", "Finland", "Finnish"], ["FR", "France", "French"], ["GA", "Gabon", "Gabonese"],
  ["GM", "Gambia", "Gambian"], ["GE", "Georgia", "Georgian"], ["DE", "Germany", "German"],
  ["GH", "Ghana", "Ghanaian"], ["GR", "Greece", "Greek"], ["GD", "Grenada", "Grenadian"],
  ["GT", "Guatemala", "Guatemalan"], ["GN", "Guinea", "Guinean"], ["GW", "Guinea-Bissau", "Guinean"],
  ["GY", "Guyana", "Guyanese"], ["HT", "Haiti", "Haitian"], ["HN", "Honduras", "Honduran"],
  ["HK", "Hong Kong", "Hong Konger"], ["HU", "Hungary", "Hungarian"], ["IS", "Iceland", "Icelandic"],
  ["IN", "India", "Indian"], ["ID", "Indonesia", "Indonesian"], ["IR", "Iran", "Iranian"],
  ["IQ", "Iraq", "Iraqi"], ["IE", "Ireland", "Irish"], ["IL", "Israel", "Israeli"],
  ["IT", "Italy", "Italian"], ["JM", "Jamaica", "Jamaican"], ["JP", "Japan", "Japanese"],
  ["JO", "Jordan", "Jordanian"], ["KZ", "Kazakhstan", "Kazakhstani"], ["KE", "Kenya", "Kenyan"],
  ["KI", "Kiribati", "Kiribati"], ["KW", "Kuwait", "Kuwaiti"], ["KG", "Kyrgyzstan", "Kyrgyzstani"],
  ["LA", "Laos", "Laotian"], ["LV", "Latvia", "Latvian"], ["LB", "Lebanon", "Lebanese"],
  ["LS", "Lesotho", "Basotho"], ["LR", "Liberia", "Liberian"], ["LY", "Libya", "Libyan"],
  ["LI", "Liechtenstein", "Liechtensteiner"], ["LT", "Lithuania", "Lithuanian"], ["LU", "Luxembourg", "Luxembourgish"],
  ["MO", "Macao", "Macanese"], ["MG", "Madagascar", "Malagasy"], ["MW", "Malawi", "Malawian"],
  ["MY", "Malaysia", "Malaysian"], ["MV", "Maldives", "Maldivian"], ["ML", "Mali", "Malian"],
  ["MT", "Malta", "Maltese"], ["MH", "Marshall Islands", "Marshallese"], ["MR", "Mauritania", "Mauritanian"],
  ["MU", "Mauritius", "Mauritian"], ["MX", "Mexico", "Mexican"], ["FM", "Micronesia", "Micronesian"],
  ["MD", "Moldova", "Moldovan"], ["MC", "Monaco", "Monacan"], ["MN", "Mongolia", "Mongolian"],
  ["ME", "Montenegro", "Montenegrin"], ["MA", "Morocco", "Moroccan"], ["MZ", "Mozambique", "Mozambican"],
  ["MM", "Myanmar", "Burmese"], ["NA", "Namibia", "Namibian"], ["NR", "Nauru", "Nauruan"],
  ["NP", "Nepal", "Nepali"], ["NL", "Netherlands", "Dutch"], ["NZ", "New Zealand", "New Zealander"],
  ["NI", "Nicaragua", "Nicaraguan"], ["NE", "Niger", "Nigerien"], ["NG", "Nigeria", "Nigerian"],
  ["KP", "North Korea", "North Korean"], ["MK", "North Macedonia", "Macedonian"], ["NO", "Norway", "Norwegian"],
  ["OM", "Oman", "Omani"], ["PK", "Pakistan", "Pakistani"], ["PW", "Palau", "Palauan"],
  ["PS", "Palestine", "Palestinian"], ["PA", "Panama", "Panamanian"], ["PG", "Papua New Guinea", "Papua New Guinean"],
  ["PY", "Paraguay", "Paraguayan"], ["PE", "Peru", "Peruvian"], ["PH", "Philippines", "Filipino"],
  ["PL", "Poland", "Polish"], ["PT", "Portugal", "Portuguese"], ["QA", "Qatar", "Qatari"],
  ["RO", "Romania", "Romanian"], ["RU", "Russia", "Russian"], ["RW", "Rwanda", "Rwandan"],
  ["KN", "Saint Kitts and Nevis", "Kittitian"], ["LC", "Saint Lucia", "Saint Lucian"],
  ["VC", "Saint Vincent and the Grenadines", "Vincentian"], ["WS", "Samoa", "Samoan"], ["SM", "San Marino", "Sammarinese"],
  ["ST", "Sao Tome and Principe", "Sao Tomean"], ["SA", "Saudi Arabia", "Saudi"], ["SN", "Senegal", "Senegalese"],
  ["RS", "Serbia", "Serbian"], ["SC", "Seychelles", "Seychellois"], ["SL", "Sierra Leone", "Sierra Leonean"],
  ["SG", "Singapore", "Singaporean"], ["SK", "Slovakia", "Slovak"], ["SI", "Slovenia", "Slovenian"],
  ["SB", "Solomon Islands", "Solomon Islander"], ["SO", "Somalia", "Somali"], ["ZA", "South Africa", "South African"],
  ["KR", "South Korea", "South Korean"], ["SS", "South Sudan", "South Sudanese"], ["ES", "Spain", "Spanish"],
  ["LK", "Sri Lanka", "Sri Lankan"], ["SD", "Sudan", "Sudanese"], ["SR", "Suriname", "Surinamese"],
  ["SE", "Sweden", "Swedish"], ["CH", "Switzerland", "Swiss"], ["SY", "Syria", "Syrian"],
  ["TW", "Taiwan", "Taiwanese"], ["TJ", "Tajikistan", "Tajikistani"], ["TZ", "Tanzania", "Tanzanian"],
  ["TH", "Thailand", "Thai"], ["TL", "Timor-Leste", "Timorese"], ["TG", "Togo", "Togolese"],
  ["TO", "Tonga", "Tongan"], ["TT", "Trinidad and Tobago", "Trinidadian"], ["TN", "Tunisia", "Tunisian"],
  ["TR", "Turkey", "Turkish"], ["TM", "Turkmenistan", "Turkmen"], ["TV", "Tuvalu", "Tuvaluan"],
  ["UG", "Uganda", "Ugandan"], ["UA", "Ukraine", "Ukrainian"], ["AE", "United Arab Emirates", "Emirati"],
  ["GB", "United Kingdom", "British"], ["US", "United States", "American"], ["UY", "Uruguay", "Uruguayan"],
  ["UZ", "Uzbekistan", "Uzbekistani"], ["VU", "Vanuatu", "Vanuatuan"], ["VA", "Vatican City", "Vatican"],
  ["VE", "Venezuela", "Venezuelan"], ["VN", "Vietnam", "Vietnamese"], ["YE", "Yemen", "Yemeni"],
  ["ZM", "Zambia", "Zambian"], ["ZW", "Zimbabwe", "Zimbabwean"],
];

function flagUrl(iso) {
  return `/img/flags/${iso.toLowerCase()}.svg`;
}

export const COUNTRIES = countriesData.map(([code, name, nationality]) => ({
  code,
  name,
  nationality,
  flagUrl: flagUrl(code),
}));
