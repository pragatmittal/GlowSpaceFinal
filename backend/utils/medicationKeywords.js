// medicationKeywords.js
const medicationKeywords = [
  "xanax", "prozac", "zoloft", "paxil", "celexa", "lexapro", "luvox", "effexor", "cymbalta", "pristiq",
  "wellbutrin", "remeron", "trazodone", "elavil", "tofranil", "nortriptyline", "lithium", "seroquel", "abilify", "risperdal",
  "geodon", "clozapine", "olanzapine", "haldol", "thorazine", "valium", "ativan", "klonopin", "buspar", "lamictal",
  "tegretol", "depakote", "gabapentin", "topamax", "ambien", "lunesta", "restoril", "vyvanse", "adderall", "ritalin"
];

const medicationHints = {
  "xanax": "Xanax is a high-impact medication. Please use as prescribed.",
  "prozac": "Prozac is commonly prescribed for depression.",
  "zoloft": "Zoloft is an SSRI. Follow your provider's advice.",
  "paxil": "Paxil is used for anxiety and depression.",
  "celexa": "Celexa is an SSRI. Take as directed.",
  "lexapro": "Lexapro is used for mood disorders.",
  "luvox": "Luvox is often used for OCD.",
  "effexor": "Effexor is an SNRI. Monitor for side effects.",
  "cymbalta": "Cymbalta is used for depression and pain.",
  "pristiq": "Pristiq is an SNRI. Take as prescribed.",
  "wellbutrin": "Wellbutrin is used for depression and quitting smoking.",
  "remeron": "Remeron can help with sleep and mood.",
  "trazodone": "Trazodone is often used for sleep.",
  "elavil": "Elavil is a tricyclic antidepressant.",
  "tofranil": "Tofranil is used for depression.",
  "nortriptyline": "Nortriptyline is a tricyclic antidepressant.",
  "lithium": "Lithium is a high-impact mood stabilizer.",
  "seroquel": "Seroquel is an antipsychotic. Use as prescribed.",
  "abilify": "Abilify is an antipsychotic. Monitor for side effects.",
  "risperdal": "Risperdal is an antipsychotic.",
  "geodon": "Geodon is an antipsychotic.",
  "clozapine": "Clozapine is a high-risk antipsychotic.",
  "olanzapine": "Olanzapine is an antipsychotic.",
  "haldol": "Haldol is a typical antipsychotic.",
  "thorazine": "Thorazine is a typical antipsychotic.",
  "valium": "Valium is a benzodiazepine. Use with caution.",
  "ativan": "Ativan is a benzodiazepine. Use as prescribed.",
  "klonopin": "Klonopin is a benzodiazepine.",
  "buspar": "Buspar is used for anxiety.",
  "lamictal": "Lamictal is a mood stabilizer.",
  "tegretol": "Tegretol is a mood stabilizer.",
  "depakote": "Depakote is a mood stabilizer.",
  "gabapentin": "Gabapentin is used for anxiety and pain.",
  "topamax": "Topamax is used for mood and migraines.",
  "ambien": "Ambien is a sleep aid.",
  "lunesta": "Lunesta is a sleep aid.",
  "restoril": "Restoril is a sleep aid.",
  "vyvanse": "Vyvanse is a stimulant for ADHD.",
  "adderall": "Adderall is a stimulant for ADHD.",
  "ritalin": "Ritalin is a stimulant for ADHD."
};

// Higher score for high-risk medications
const medicationScores = {
  "xanax": 5, "lithium": 5, "clozapine": 5, "seroquel": 4, "abilify": 4, "risperdal": 4, "olanzapine": 4, "haldol": 4, "thorazine": 4,
  "valium": 4, "ativan": 4, "klonopin": 4, "depakote": 4, "tegretol": 4, "lamictal": 4,
  // Others default to 2
};

module.exports = { medicationKeywords, medicationHints, medicationScores }; 