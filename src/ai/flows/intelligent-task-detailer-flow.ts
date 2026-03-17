'use server';
/**
 * @fileOverview This file implements a Genkit flow for intelligently detailing tasks.
 *
 * - intelligentTaskDetailer - A function that takes a task title and generates a detailed description and sub-tasks.
 * - IntelligentTaskDetailerInput - The input type for the intelligentTaskDetailer function.
 * - IntelligentTaskDetailerOutput - The return type for the intelligentTaskDetailer function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const IntelligentTaskDetailerInputSchema = z.object({
  taskTitle: z.string().describe('A brief title for the task.'),
});
export type IntelligentTaskDetailerInput = z.infer<typeof IntelligentTaskDetailerInputSchema>;

const IntelligentTaskDetailerOutputSchema = z.object({
  detailedDescription: z.string().describe('A comprehensive description of the task, expanding on the title.'),
  subTasks: z.array(z.string()).describe('An array of suggested sub-tasks to complete the main task.'),
});
export type IntelligentTaskDetailerOutput = z.infer<typeof IntelligentTaskDetailerOutputSchema>;

export async function intelligentTaskDetailer(input: IntelligentTaskDetailerInput): Promise<IntelligentTaskDetailerOutput> {
  return intelligentTaskDetailerFlow(input);
}

const intelligentTaskDetailerPrompt = ai.definePrompt({
  name: 'intelligentTaskDetailerPrompt',
  input: { schema: IntelligentTaskDetailerInputSchema },
  output: { schema: IntelligentTaskDetailerOutputSchema },
  prompt: `You are an AI assistant specialized in breaking down tasks and providing detailed descriptions.
Your goal is to help users quickly define comprehensive tasks based on a brief title.

Given the following brief task title, generate a comprehensive detailed description and a list of suggested sub-tasks.
The output MUST be a JSON object that strictly adheres to the provided output schema.

Task Title: {{{taskTitle}}}`,
});

const intelligentTaskDetailerFlow = ai.defineFlow(
  {
    name: 'intelligentTaskDetailerFlow',
    inputSchema: IntelligentTaskDetailerInputSchema,
    outputSchema: IntelligentTaskDetailerOutputSchema,
  },
  async (input) => {
    const { output } = await intelligentTaskDetailerPrompt(input);
    return output!;
  }
);
