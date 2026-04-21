import axios from "axios";
import type { SymptomInput } from "../types/symptom.type.js";
import { config } from "../config/index.js";

// symptom schema serveritiy category and arch type in the template 
const SEVERITY_CODES: Record<string , string> = {
  Mild: "at0023",
  Moderate: "at0024",
  Severe: "at0025",
}

// openehr auth credentials
const auth = {
  username: config.ehr.authuser,
  password: config.ehr.authpasswd,
}

// create an ehr record for the patient if one doesn't exist yet
export async function getOrCreateEhr(patientId: string): Promise<string> {
  try {
    // try to find the patient's existing EHR 
    const res = await axios.get(
      `${config.ehr.baseurl}/ehr?subject_id=${patientId}&subject_namespace=local`,
      {auth}
    )
    return res.data.ehr_id.value;
  } catch {
    // create a new ehr for the patient
    const res = await axios.post(`${config.ehr.baseurl}/ehr`, {
      _type: "EHR_STATUS",
      subject: {
        external_ref: {
          id: {_type: "GENERIC_ID", value: patientId, scheme: "local"},
          namespace: "local",
          type: "PERSON",
        },
      },
      is_quaryable: true, // Allow aql queries
      is_modifiable: true, // allow new compositions
    })
    return res.data.ehr_id.value;
  }
}

// store full compostion in EHRbase
export async function storeComposition(ehrId: string, input: SymptomInput): Promise<string> {
  const now = new Date().toISOString();
  const composition = {
    _type: 'COMPOSITION',
    archetype_node_id: 'openEHR-EHR-COMPOSITION.encounter.v1',
    name: { _type: 'DV_TEXT', value: 'Encounter' },

    archetype_details: {
      _type: 'ARCHETYPED',
      archetype_id: { _type: 'ARCHETYPE_ID', value: 'openEHR-EHR-COMPOSITION.encounter.v1' },
      template_id: { _type: 'TEMPLATE_ID', value: 'new_template' },
      rm_version: '1.0.4',
    },
    
    language: { _type: 'CODE_PHRASE', terminology_id: { _type: 'TERMINOLOGY_ID', value: 'ISO_639-1' }, code_string: 'en' },
    territory: { _type: 'CODE_PHRASE', terminology_id: { _type: 'TERMINOLOGY_ID', value: 'ISO_3166-1' }, code_string: 'EN' },

    category: {
      _type: 'DV_CODED_TEXT',
      value: 'event',
      defining_code: { _type: 'CODE_PHRASE', terminology_id: { _type: 'TERMINOLOGY_ID', value: 'openehr' }, code_string: '433' },
    },
    
    composer: { _type: 'PARTY_SELF' },
    
    context: {
      _type: 'EVENT_CONTEXT',
      start_time: { _type: 'DV_DATE_TIME', value: now },
      setting: {
        _type: 'DV_CODED_TEXT',
        value: 'other care',
        defining_code: { _type: 'CODE_PHRASE', terminology_id: { _type: 'TERMINOLOGY_ID', value: 'openehr' }, code_string: '238' },
      },
    },

    content: input.symptoms.map(buildSymptomObservation),
  }

  // post compostion to the patient's EHR
  const res = await axios.post(
    `${config.ehr.baseurl}/ehr/${ehrId}/compostion`,
    composition,
    { auth, headers: { "Content-Type": "application/json" }}
  )

  return res.data.uid.value;
}

// query patient symptom history for llm context
// aql -> archetype query language 
export async function queryPatientHistory(ehrId: string): Promise<string> {
  const aql = `
    SELECT
      s/data[at0190]/events[at0191]/data[at0192]/items[at0001]/value/value AS name,
      s/data[at0190]/events[at0191]/data[at0192]/items[at0021]/value/value AS severity,
      s/data[at0190]/events[at0191]/data[at0192]/items[at0028]/value/value AS duration
    FROM EHR e
    CONTAINS COMPOSITION c
    CONTAINS OBSERVATION s[openEHR-EHR-OBSERVATION.symptom_sign.v0]
    WHERE e/ehr_id/value = '${ehrId}'
    ORDER BY c/context/start_time/value DESC
    LIMIT 10
`;
  const res = await axios.post(`${config.ehr.baseurl}/query/aql`, { q: aql }, { auth });
  const rows: any[] = res.data.rows ?? [];

  if (rows.length == 0) return "No prior symptom history";

  return rows.map(r => `- ${r[0]}${r[1] ? ` (${r[1]})` : ''}${r[2] ? `, duration: ${r[2]}` : ''}`).join("\n");
}

// build symptom observation
// take one symptom from API input and convert it into an openEHR OBSERVATION object
function buildSymptomObservation(symptom: SymptomInput["symptoms"][number]) {
  const now = new Date().toISOString();

  // symptom name (required) at0001
  const items: object[] = [{
    _type: "ELEMENT",
    archetype_node_id: "at0001",
    name: { _type: "DV_TEXT", value: "Symptom/Sign name" },
    value: { _type: "DV_TEXT", value: symptom.name },
  }];

  // optional fields

  // severity category: Mild / Moderate / Severe
  // uses DV_CODED_TEXT
  if (symptom.severityCategory) {
    items.push({
      _type: "ELEMENT",
      archetype_node_id: "at0021",
      name: { _type: "DV_TEXT", value: "Severity category" },
      value: {
        _type: "DV_CODED_TEXT",
        value: symptom.severityCategory,
        defining_code: {
          _type: "CODE_PHRASE",
          terminology_id: { _type: "TERMINOLOGY_ID", value: "local" },
          code_string: SEVERITY_CODES[symptom.severityCategory],
        },
      },
    })
  }

  // severity rating: numeric 0-10 
  // uses DV_QUANTITY
  if (symptom.severityRating !== undefined) {
    items.push({
      _type: "ELEMENT",
      archetype_node_id: "at0026",
      name: { _type: "DV_TEXT", value: "Severity rating" },
      value: { _type: "DV_QUANTITY", value: symptom.severityRating, units: "1" },
    })
  }

  // duration: how long the symptom has been present
  // uses DV_DURATION
  if (symptom.duration) {
    items.push({
      _type: "ELEMENT",
      archetype_node_id: "at0028",
      name: { _type: "DV_TEXT", value: "Duration" },
      value: { _type: "DV_DURATION", value: symptom.duration },
    })
  }

  // body site: where on the body the symptom is felt
  if (symptom.bodySite) {
    items.push({
      _type: "ELEMENT",
      archetype_node_id: "at0151",
      name: { _type: "DV_TEXT", value: "Body site" },
      value: { _type: "DV_TEXT", value: symptom.bodySite },
    })
  }

  // character: how the symptom feels e.g. throbbing, burning, sharp
  if (symptom.character) {
    items.push({
      _type: "ELEMENT",
      archetype_node_id: "at0189",
      name: { _type: "DV_TEXT", value: "Character" },
      value: { _type: "DV_TEXT", value: symptom.character },
    })
  }

  // pattern: how the symptom behaves over time e.g. constant, intermittent
  if (symptom.pattern) {
    items.push({
      _type: "ELEMENT",
      archetype_node_id: "at0003",
      name: { _type: "DV_TEXT", value: "Pattern" },
      value: { _type: "DV_TEXT", value: symptom.pattern },
    })
  }

  // onset type: how the symptom started e.g. sudden, gradual
  if (symptom.onsetType) {
    items.push({
      _type: "ELEMENT",
      archetype_node_id: "at0164",
      name: { _type: "DV_TEXT", value: "Onset type" },
      value: { _type: "DV_TEXT", value: symptom.onsetType },
    })
  }

  // wrap the items in the full OBSERVATION structure required by the openEHR
  return {
    _type: 'OBSERVATION',
    archetype_node_id: 'openEHR-EHR-OBSERVATION.symptom_sign.v0',
    name: { _type: 'DV_TEXT', value: 'Symptom/Sign' },
    language: { _type: 'CODE_PHRASE', terminology_id: { _type: 'TERMINOLOGY_ID', value: 'ISO_639-1' }, code_string: 'en' },
    encoding: { _type: 'CODE_PHRASE', terminology_id: { _type: 'TERMINOLOGY_ID', value: 'IANA_character-sets' }, code_string: 'UTF-8' },
    subject: { _type: 'PARTY_SELF' }, 
    data: {
      _type: 'HISTORY',
      archetype_node_id: 'at0190',
      name: { _type: 'DV_TEXT', value: 'Event Series' },
      origin: { _type: 'DV_DATE_TIME', value: now },
      events: [{
        _type: 'POINT_EVENT',       
        archetype_node_id: 'at0191',
        name: { _type: 'DV_TEXT', value: 'Any event' },
        time: { _type: 'DV_DATE_TIME', value: now },
        data: {
          _type: 'ITEM_TREE',       
          archetype_node_id: 'at0192',
          name: { _type: 'DV_TEXT', value: 'Tree' },
          items,                    
        },
      }],
    },
  }
}
