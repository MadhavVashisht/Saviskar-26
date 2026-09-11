import fs from "fs";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

async function createRulebook(arenaName, subtitle, eventsList, filename) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();

  // Dark header background
  page.drawRectangle({
    x: 0,
    y: height - 140,
    width,
    height: 140,
    color: rgb(0.04, 0.04, 0.06),
  });

  // Purple accent strip
  page.drawRectangle({
    x: 0,
    y: height - 144,
    width,
    height: 4,
    color: rgb(0.66, 0.33, 0.97),
  });

  // University Header
  page.drawText("CGC UNIVERSITY • MOHALI", {
    x: 50,
    y: height - 45,
    size: 10,
    font: fontBold,
    color: rgb(0.7, 0.7, 0.75),
  });

  // Title
  page.drawText(`SAVISKAR 2026 — ${arenaName.toUpperCase()} RULEBOOK`, {
    x: 50,
    y: height - 80,
    size: 18,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // Tagline
  page.drawText(`Official Arena Regulations & Guidelines • ${subtitle}`, {
    x: 50,
    y: height - 105,
    size: 10,
    font,
    color: rgb(0.8, 0.75, 0.9),
  });

  let y = height - 180;

  // General Instructions
  page.drawText("1. GENERAL ELIGIBILITY & REGISTRATION", {
    x: 50,
    y,
    size: 12,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  y -= 20;

  const generalLines = [
    "• Valid college/university student ID card is mandatory for all participants at registration check-in.",
    "• All teams must report to the venue desk at least 45 minutes prior to their scheduled event start.",
    "• Any violation of university code of conduct or unsportsmanlike behavior will result in immediate disqualification.",
    "• The decision of the judging panel and festival convenors shall be final and binding.",
  ];

  for (const line of generalLines) {
    page.drawText(line, { x: 60, y, size: 9, font, color: rgb(0.25, 0.25, 0.25) });
    y -= 16;
  }

  y -= 15;
  page.drawText("2. ARENA COMPETITIONS & FORMAT", {
    x: 50,
    y,
    size: 12,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  y -= 22;

  for (const ev of eventsList) {
    page.drawText(`• ${ev.title}:`, { x: 60, y, size: 10, font: fontBold, color: rgb(0.15, 0.15, 0.2) });
    y -= 15;
    page.drawText(`  ${ev.desc}`, { x: 70, y, size: 9, font, color: rgb(0.35, 0.35, 0.35) });
    y -= 18;
  }

  y -= 15;
  page.drawText("3. OFFICIAL HELPLINE & QUERIES", {
    x: 50,
    y,
    size: 12,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  y -= 20;

  page.drawText("Email: saviskar@cgcuniversity.in  |  Helpline: +91 76673 40235, +91 80997 31133", {
    x: 60,
    y,
    size: 9,
    font,
    color: rgb(0.25, 0.25, 0.25),
  });
  y -= 16;
  page.drawText("Venue: CGC University, Sector 112, Landran, Mohali, Punjab", {
    x: 60,
    y,
    size: 9,
    font,
    color: rgb(0.25, 0.25, 0.25),
  });

  // Footer
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height: 35,
    color: rgb(0.04, 0.04, 0.06),
  });

  page.drawText("Saviskar 2026 • Aevorian Reverie • www.cgcuniversity.in", {
    x: 50,
    y: 12,
    size: 8,
    font,
    color: rgb(0.7, 0.7, 0.75),
  });

  const pdfBytes = await pdfDoc.save();
  const targetDir = path.resolve("./public/rulebooks");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  fs.writeFileSync(path.join(targetDir, filename), pdfBytes);
  console.log(`Generated ${filename}`);
}

async function run() {
  await createRulebook("Cultural Arena", "Dance. Music. Performance.", [
    { title: "Step Stars (Solo Dance)", desc: "Time limit: 3-5 mins. Props allowed with prior approval. Audio tracks on pen drive." },
    { title: "Step It Up (Western Dance Crew)", desc: "Team size: 8-20 members. Time limit: 6-8 mins. Judged on synchronization and choreography." },
    { title: "Gully War (Rap Battle)", desc: "Original lyrics required. Rounds of 90 seconds. No profanity or explicit vulgarity." },
    { title: "Battle of Bands", desc: "Time limit: 12 mins (including setup). Drum kit provided. Judged on tight arrangement." },
  ], "saviskar-2026-cultural-rulebook.pdf");

  await createRulebook("Technical Arena", "Build. Invent. Compete.", [
    { title: "Code Cracker (Bug Hunt)", desc: "Competitive debugging and algorithmic problem solving. Languages: C++, Java, Python." },
    { title: "Dronathon", desc: "Drone obstacle clearance and aerial stability challenge. Pre-flight safety check mandatory." },
    { title: "RoboRace", desc: "Autonomous and manually controlled bots on dynamic racing tracks with varying terrain." },
    { title: "TechXhibit", desc: "Working hardware and software prototypes aligned with sustainable technological innovation." },
  ], "saviskar-2026-technical-rulebook.pdf");

  await createRulebook("Sports Arena", "Play. Push. Win.", [
    { title: "Track & Field Sprinting", desc: "Standard IAAF track guidelines apply. Clean spikes and designated jerseys mandatory." },
    { title: "Basketball Invitational", desc: "4 quarters of 10 mins each. FIBA tournament rules enforced by certified referees." },
    { title: "Badminton Open", desc: "Best of 3 sets of 21 points. Non-marking gum sole shoes strictly mandatory." },
    { title: "Volleyball Championship", desc: "Rally point system. Best of 3 sets. Rotation and net contact violations strictly enforced." },
  ], "saviskar-2026-sports-rulebook.pdf");

  await createRulebook("Non-Technical Arena", "Create. Think. Express.", [
    { title: "Doodle Art & Face Painting", desc: "Theme announced on the spot. Materials must be skin-safe. Time limit: 90 minutes." },
    { title: "Short Film Contest", desc: "Maximum duration: 7 minutes. Must include festival title card. Original cinematography only." },
    { title: "Open Mic & Standup", desc: "Original content only. 4-minute strict timer. Audience engagement and stage presence." },
    { title: "Best Out of Waste", desc: "Create functional or sculptural models from repurposed discarded campus materials." },
  ], "saviskar-2026-non-technical-rulebook.pdf");
}

run();
