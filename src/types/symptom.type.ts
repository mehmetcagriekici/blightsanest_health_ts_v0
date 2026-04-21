import { z } from "zod";

export const SymptomSchema = z.object({
  patientId: z.string().uuid(),
  symptoms: z.array(z.object({
    name: z.string(), // at0001
    bodySite: z.string().optional(), // at0151
    severityCategory: z.enum(["Mild", "Moderate", "Severe"]).optional(), // at0021
    severityRating: z.number().min(0).max(10).optional(), // at0026
    duration: z.string().optional(), // at0028
    onsetType: z.string().optional(), // at0164
    character: z.string().optional(), // at0189
    pattern: z.string().optional(), // at0003
  })).min(1),
});

export type SymptomInput = z.infer<typeof SymptomSchema>;
