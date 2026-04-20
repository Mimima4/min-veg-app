import fetch from "node-fetch";

const ORGNR = process.argv[2];

if (!ORGNR) {
  console.error("Usage: node scripts/probe-nsr-enhet-detail.mjs <organisasjonsnummer>");
  process.exit(1);
}

const URL = `https://data-nsr.udir.no/v4/enhet/${ORGNR}`;

async function run() {
  const res = await fetch(URL, {
    headers: {
      accept: "application/json",
    },
  });

  console.log("STATUS:", res.status);
  console.log("FINAL URL:", res.url);

  const text = await res.text();

  if (!res.ok) {
    console.log("\nRAW RESPONSE:");
    console.log(text.slice(0, 1200));
    process.exit(1);
  }

  const data = JSON.parse(text);

  console.log("\nRESULT:");
  console.log(JSON.stringify({
    Organisasjonsnummer: data.Organisasjonsnummer,
    Navn: data.Navn,
    FulltNavn: data.FulltNavn,
    Fylke: data.Fylke?.Navn,
    Fylkesnummer: data.Fylke?.Fylkesnummer,
    Kommune: data.Kommune?.Navn,
    Kommunenummer: data.Kommune?.Kommunenummer,
    ErAktiv: data.ErAktiv,
    ErVideregaaendeSkole: data.ErVideregaaendeSkole,
    Internettadresse: data.Internettadresse,
    DatoEndret: data.DatoEndret,
  }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});