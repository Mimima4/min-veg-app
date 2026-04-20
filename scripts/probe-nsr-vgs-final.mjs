import fetch from "node-fetch";

const URL =
  "https://data-nsr.udir.no/v4/enheter?sidenummer=1&antallPerSide=1000";

async function run() {
  const res = await fetch(URL, {
    headers: {
      accept: "application/json",
    },
  });

  console.log("STATUS:", res.status);

  const data = await res.json();
  const units = data.EnhetListe ?? [];

  console.log("TOTAL UNITS:", units.length);

  const vgs = units.filter(
    (u) => u.ErVideregaaendeSkole === true && u.ErAktiv === true
  );

  console.log("TOTAL ACTIVE VGS:", vgs.length);

  const sample = vgs.slice(0, 10).map((u) => ({
    orgnr: u.Organisasjonsnummer,
    name: u.Navn,
    kommune: u.Kommunenummer,
    fylke: u.Fylkesnummer,
    website: u.Internettadresse,
  }));

  console.log("\nSAMPLE:");
  console.table(sample);

  const oslo = vgs.filter((u) =>
    String(u.Kommunenummer ?? "").startsWith("03")
  );

  console.log("\nOSLO VGS:", oslo.length);

  const osloSample = oslo.slice(0, 10).map((u) => ({
    orgnr: u.Organisasjonsnummer,
    name: u.Navn,
    website: u.Internettadresse,
  }));

  console.log("\nOSLO SAMPLE:");
  console.table(osloSample);
}

run().catch(console.error);