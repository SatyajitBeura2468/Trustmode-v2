import type { Proposal, Scenario, ScenarioId } from "./types";

const proposal = (
  scenario: ScenarioId,
  id: string,
  label: string,
  current: string,
  proposed: string,
  evidence: string,
  privacy: string,
  consequence: string,
  statement: string,
  confidence = 0.96,
): Proposal => ({
  scenario,
  id,
  label,
  current,
  proposed,
  evidence,
  privacy,
  consequence,
  statement,
  purpose: consequence,
  confidence,
  action: "set-field",
  reversible: true,
  risk: "low",
  ownerOnly: false,
  status: "pending",
  target: {
    adapter: "controlled-portal",
    field: id,
    expectedCurrent: current,
  },
});

export const scenarios: Record<ScenarioId, Scenario> = {
  scholarship: {
    id: "scholarship",
    title: "Scholarship application",
    shortTitle: "Scholarship",
    description: "Prepare education and eligibility details without exposing identity documents.",
    accent: "#9d6200",
    task: "Help complete a fictional student scholarship application.",
    helperName: "Priya",
    ownerName: "Aarav",
    derivedFacts: [
      "Applicant meets the age requirement.",
      "Household income is below the eligibility limit.",
      "Class 10 certificate is valid.",
    ],
    allowedTargets: ["board", "passing-year", "institution"],
    proposals: [
      proposal("scholarship", "board", "Board", "Not provided", "CBSE", "Class 10 certificate · verified", "The complete certificate stays hidden. Only the board name is shared.", "This fills one education field. It does not submit the application.", "Select CBSE as the applicant’s board"),
      proposal("scholarship", "passing-year", "Passing year", "Not provided", "2023", "Class 10 certificate · verified", "The marksheet and roll number stay hidden.", "This adds the passing year and remains editable.", "Set the applicant’s passing year to 2023", 0.93),
      proposal("scholarship", "institution", "Institution", "Not provided", "Sunrise Public School", "School record · verified", "Student identifiers stay hidden.", "This adds the school name. It does not contact the school.", "Set the institution to Sunrise Public School", 0.91),
    ],
  },
  hospital: {
    id: "hospital",
    title: "Hospital registration",
    shortTitle: "Hospital registration",
    description: "Prepare a fictional appointment while medical records and identity values remain private.",
    accent: "#315ff4",
    task: "Help prepare a fictional hospital outpatient registration.",
    helperName: "Meera",
    ownerName: "Kabir",
    derivedFacts: [
      "The selected department accepts new appointments.",
      "The patient is eligible for the concession category.",
      "A valid referral is available.",
    ],
    allowedTargets: ["department", "visit-type", "language"],
    proposals: [
      proposal("hospital", "department", "Department", "Not selected", "General medicine", "Referral category · verified", "The referral document and diagnosis stay hidden.", "This selects a department only. It does not book or pay.", "Select General medicine as the department"),
      proposal("hospital", "visit-type", "Visit type", "Not selected", "First consultation", "Registration history · derived", "Past visit details stay hidden.", "This selects the consultation type and remains reversible.", "Set visit type to First consultation", 0.94),
      proposal("hospital", "language", "Preferred language", "Not selected", "Odia", "Owner preference", "No medical information is shared.", "This helps staff prepare language support.", "Request Odia language support", 0.89),
    ],
  },
  admission: {
    id: "admission",
    title: "College admission",
    shortTitle: "College admission",
    description: "Prepare course choices and education details without sharing raw certificates.",
    accent: "#16785a",
    task: "Help prepare a fictional undergraduate admission form.",
    helperName: "Ananya",
    ownerName: "Ishaan",
    derivedFacts: [
      "The applicant meets the course prerequisites.",
      "The qualifying certificate is valid.",
      "The applicant belongs to the eligible district.",
    ],
    allowedTargets: ["programme", "board", "hostel"],
    proposals: [
      proposal("admission", "programme", "Programme", "Not selected", "B.Sc. Physics", "Course preference", "Rank and identity values stay hidden.", "This records a course preference; it does not accept an offer.", "Select B.Sc. Physics as the programme"),
      proposal("admission", "board", "Qualifying board", "Not provided", "CHSE Odisha", "Class 12 certificate · verified", "The certificate number and marks stay hidden.", "This fills the board field and remains editable.", "Set qualifying board to CHSE Odisha", 0.95),
      proposal("admission", "hostel", "Hostel preference", "Not selected", "Interested", "Owner preference", "Address and household data stay hidden.", "This records interest only; it does not reserve or charge.", "Mark hostel preference as Interested", 0.87),
    ],
  },
};

export const scenarioList = Object.values(scenarios);
