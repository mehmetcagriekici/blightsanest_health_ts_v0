import { Router, type Request, type Response } from "express";
import { SymptomSchema, type SymptomInput, type SymptomHistory } from "../types/symptom.type.js";
import { getOrCreateEhr, storeComposition, queryPatientHistory } from "../services/ehr.service.js";
import { getLLMResponse } from "../services/llm.service.js";

export const diagnoseRouter = Router();

diagnoseRouter.post("/", diagnoseHandler);

async function diagnoseHandler(req: Request, res: Response) {
  // validate input
  const parsed = SymptomSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({error: parsed.error.flatten()});

  const input = parsed.data;

  try {
    // get or create EHR for the user
    const ehrId = await getOrCreateEhr(input.patientId);
    
    // store the current symptoms in EHRbase
    const compositionId = await storeComposition(ehrId, input);

    // query patient history
    const history: SymptomHistory[] = await queryPatientHistory(ehrId);

    // send current sympomts and history to the llm to get a response
    const llmResponse = await getLLMResponse(input.symptoms, history);

    // return the response
    return res.status(201).json({ehrId, compositionId, llmResponse});
  } catch (err: unknown) {
    if (err instanceof Error) return res.status(500).json({error: err.message});
  }
}
