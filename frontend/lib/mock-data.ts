import { ScreeningJob, ScreeningResult, HistoryItem } from "./types"

// Real GFP (Green Fluorescent Protein) coding sequence - commonly used lab marker, completely benign
export const EXAMPLE_GFP_SEQUENCE = `>GFP_Example Green Fluorescent Protein
ATGGTGAGCAAGGGCGAGGAGCTGTTCACCGGGGTGGTGCCCATCCTGGTCGAGCTGGACGGCGACGTAAACGGCCACAAG
TTCAGCGTGTCCGGCGAGGGCGAGGGCGATGCCACCTACGGCAAGCTGACCCTGAAGTTCATCTGCACCACCGGCAAGCTG
CCCGTGCCCTGGCCCACCCTCGTGACCACCCTGACCTACGGCGTGCAGTGCTTCAGCCGCTACCCCGACCACATGAAGCAGC
ACGACTTCTTCAAGTCCGCCATGCCCGAAGGCTACGTCCAGGAGCGCACCATCTTCTTCAAGGACGACGGCAACTACAAGAC
CCGCGCCGAGGTGAAGTTCGAGGGCGACACCCTGGTGAACCGCATCGAGCTGAAGGGCATCGACTTCAAGGAGGACGGCAA
CATCCTGGGGCACAAGCTGGAGTACAACTACAACAGCCACAACGTCTATATCATGGCCGACAAGCAGAAGAACGGCATCAAGG
TGAACTTCAAGATCCGCCACAACATCGAGGACGGCAGCGTGCAGCTCGCCGACCACTACCAGCAGAACACCCCCATCGGCGA
CGGCCCCGTGCTGCTGCCCGACAACCACTACCTGAGCACCCAGTCCGCCCTGAGCAAAGACCCCAACGAGAAGCGCGATCAC
ATGGTCCTGCTGGAGTTCGTGACCGCCGCCGGGATCACTCTCGGCATGGACGAGCTGTACAAGTAA`

// Human insulin preproinsulin - well-known therapeutic protein, cleared as low-concern
export const EXAMPLE_INSULIN_SEQUENCE = `>INS_Human Human Preproinsulin
ATGGCCCTGTGGATGCGCCTCCTGCCCCTGCTGGCGCTGCTGGCCCTCTGGGGACCTGACCCAGCCGCAGCCTTTGTGAACC
AACACCTGTGCGGCTCACACCTGGTGGAAGCTCTCTACCTAGTGTGCGGGGAACGAGGCTTCTTCTACACACCCAAGACCCGC
CGGGAGGCAGAGGACCTGCAGGTGGGGCAGGTGGAGCTGGGCGGGGGCCCTGGTGCAGGCAGCCTGCAGCCCTTGGCCCTGG
AGGGGTCCCTGCAGAAGCGTGGCATTGTGGAACAATGCTGTACCAGCATCTGCTCCCTCTACCAGCTGGAGAACTACTGCAAC
TAG`

// Synthetic construct with a known biorisk region (fictional but realistic for demo)
export const EXAMPLE_FLAGGED_SEQUENCE = `>SYN_Construct_X Synthetic construct with insert
ATGGCTAGCAAAGGAGAAGAACTCTTCACTGGAGTTGTCCCAATTCTTGTTGAATTAGATGGTGATGTTAATGGGCACAAATT
TTCTGTCAGTGGAGAGGGTGAAGGTGATGCAACATACGGAAAACTTACCCTTAAATTTATTTGCACTACTGGAAAACTACCTG
TTCCATGGCCAACACTTGTCACTACTTTCTCTTATGGTGTTCAATGCTTTTCAAGATACCCAGATCATATGAAACGGCATGAC
TTTTTCAAGAGTGCCATGCCCGAAGGTTATGTACAGGAAAGAACTATATTTTTCAAAGATGACGGGAACTACAAGACACGTGC
TGAAGTCAAGTTTGAAGGTGATACCCTTGTTAATAGAATCGAGTTAAAAGGTATTGATTTTAAAGAAGATGGAAACATTCTTG
GACACAAATTGGAATACAACTATAACTCACACAATGTATACATCATGGCAGACAAACAAAAGAATGGAATCAAAGTTAACTTCA
AAATTAGACACAACATTGAAGATGGAAGCGTTCAACTAGCAGACCATTATCAACAAAATACTCCAATTGGCGATGGCCCTGTCC
TTTTACCAGACAACCATTACCTGTCCACACAATCTGCCCTTTCGAAAGATCCCAACGAAAAGAGAGACCACATGGTCCTTCTTG
AGTTTGTAACAGCTGCTGGGATTACACATGGCATGGATGAACTATACAAAGGATCCATGTCTGATAGAGGCTATCCTTATGAT
GTTCCAGATTATGCGGGCCCAACTGGTATCTTTGGATCAGAAATAAATGATTTTTATTTTGACAAAGTATCCAATCATGATTT
AACAGTGGATAGTAATGGAACTTTAATTGCATGA`

export const MOCK_GFP_RESULT: ScreeningResult = {
  overall: "PASS",
  steps: [
    { id: "1", name: "Biorisk Scan", description: "HMM profile matching against biorisk database", status: "complete", duration: 1.2 },
    { id: "2", name: "Protein Taxonomy", description: "BLAST/DIAMOND search against NCBI nr", status: "skipped" },
    { id: "3", name: "Nucleotide Taxonomy", description: "BLASTN search against NCBI core_nt", status: "skipped" },
    { id: "4", name: "Low-Concern Check", description: "Clearing against benign databases", status: "complete", duration: 0.8 },
  ],
  regions: [
    { start: 1, end: 720, type: "benign", label: "GFP — Aequorea victoria fluorescent protein (common lab marker)" },
  ],
}

export const MOCK_INSULIN_RESULT: ScreeningResult = {
  overall: "PASS",
  steps: [
    { id: "1", name: "Biorisk Scan", description: "HMM profile matching against biorisk database", status: "complete", duration: 0.9 },
    { id: "2", name: "Protein Taxonomy", description: "BLAST/DIAMOND search against NCBI nr", status: "skipped" },
    { id: "3", name: "Nucleotide Taxonomy", description: "BLASTN search against NCBI core_nt", status: "skipped" },
    { id: "4", name: "Low-Concern Check", description: "Clearing against benign databases", status: "complete", duration: 0.6 },
  ],
  regions: [
    { start: 1, end: 333, type: "benign", label: "Insulin — Homo sapiens preproinsulin (therapeutic, low-concern)" },
  ],
}

export const MOCK_FLAGGED_RESULT: ScreeningResult = {
  overall: "FLAG",
  steps: [
    { id: "1", name: "Biorisk Scan", description: "HMM profile matching against biorisk database", status: "complete", duration: 1.5 },
    { id: "2", name: "Protein Taxonomy", description: "BLAST/DIAMOND search against NCBI nr", status: "skipped" },
    { id: "3", name: "Nucleotide Taxonomy", description: "BLASTN search against NCBI core_nt", status: "skipped" },
    { id: "4", name: "Low-Concern Check", description: "Clearing against benign databases", status: "complete", duration: 1.1 },
  ],
  regions: [
    { start: 1, end: 720, type: "benign", label: "GFP variant — fluorescent protein (benign)" },
    { start: 721, end: 891, type: "biorisk", label: "Flagged region — matches biorisk HMM profile (toxin-like domain)", score: 0.94 },
    { start: 892, end: 960, type: "unknown", label: "Uncharacterized region" },
  ],
}

export const EXAMPLE_SEQUENCES = [
  {
    name: "Green Fluorescent Protein (GFP)",
    description: "Common lab marker protein from jellyfish. Expected result: PASS",
    sequence: EXAMPLE_GFP_SEQUENCE,
    mockResult: MOCK_GFP_RESULT,
  },
  {
    name: "Human Insulin",
    description: "Therapeutic protein, well-characterized. Expected result: PASS",
    sequence: EXAMPLE_INSULIN_SEQUENCE,
    mockResult: MOCK_INSULIN_RESULT,
  },
  {
    name: "Synthetic Construct (Flagged)",
    description: "Synthetic sequence with a flagged insert region. Expected result: FLAG",
    sequence: EXAMPLE_FLAGGED_SEQUENCE,
    mockResult: MOCK_FLAGGED_RESULT,
  },
]

export const MOCK_HISTORY: HistoryItem[] = [
  {
    id: "job_gfp001",
    timestamp: "2026-03-23T10:30:00Z",
    name: "GFP Reporter Construct",
    sequence: EXAMPLE_GFP_SEQUENCE.split("\n").slice(1).join(""),
    length: 720,
    status: "PASS",
    result: MOCK_GFP_RESULT,
  },
  {
    id: "job_ins002",
    timestamp: "2026-03-22T14:15:00Z",
    name: "Human Insulin Expression Vector",
    sequence: EXAMPLE_INSULIN_SEQUENCE.split("\n").slice(1).join(""),
    length: 333,
    status: "PASS",
    result: MOCK_INSULIN_RESULT,
  },
  {
    id: "job_syn003",
    timestamp: "2026-03-21T09:45:00Z",
    name: "Synthetic Construct X — Flagged",
    sequence: EXAMPLE_FLAGGED_SEQUENCE.split("\n").slice(1).join(""),
    length: 960,
    status: "FLAG",
    result: MOCK_FLAGGED_RESULT,
  },
  {
    id: "job_vec004",
    timestamp: "2026-03-20T16:20:00Z",
    name: "pUC19 Vector Backbone",
    sequence: "TCGCGCGTTTCGGTGATGACGGTGAAAACCTCTGACACATGCAGCTCCCGGAGACGGTCACAGCTTGTCTGTAA",
    length: 2686,
    status: "PASS",
  },
]
