'use server';
/**
 * @fileOverview An AI assistant flow for generating engaging and appetizing dish descriptions for street food menu items.
 *
 * - generateDishDescription - A function that generates a dish description.
 * - GenerateDishDescriptionInput - The input type for the generateDishDescription function.
 * - GenerateDishDescriptionOutput - The return type for the generateDishDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const GenerateDishDescriptionInputSchema = z.object({
  dishName: z.string().describe('The name of the menu item.'),
  ingredients: z
    .string()
    .optional()
    .describe('Key ingredients of the dish, e.g., "grilled chicken, corn tortillas, fresh salsa, cilantro, a squeeze of lime".'),
  cuisineType: z
    .string()
    .optional()
    .describe('The type of cuisine, e.g., "Mexican Street Food", "Indian Street Food", "Thai".'),
  tasteProfile: z
    .string()
    .optional()
    .describe('Keywords describing the taste and experience, e.g., "bold, tangy, spicy, refreshing, savory, crispy".'),
  targetAudience: z
    .string()
    .optional()
    .describe('Optional: Who is this dish for? e.g., "adventurous eaters", "comfort food lovers".'),
  keywordsToInclude: z
    .string()
    .optional()
    .describe('Optional: Specific words or phrases to include in the description, comma-separated.'),
  keywordsToExclude: z
    .string()
    .optional()
    .describe('Optional: Specific words or phrases to avoid in the description, comma-separated.'),
});
export type GenerateDishDescriptionInput = z.infer<typeof GenerateDishDescriptionInputSchema>;

// Output Schema
const GenerateDishDescriptionOutputSchema = z.object({
  dishDescription: z
    .string()
    .describe('An engaging and appetizing description for the menu item.'),
});
export type GenerateDishDescriptionOutput = z.infer<typeof GenerateDishDescriptionOutputSchema>;

// Define the prompt
const generateDishDescriptionPrompt = ai.definePrompt({
  name: 'generateDishDescriptionPrompt',
  input: {schema: GenerateDishDescriptionInputSchema},
  output: {schema: GenerateDishDescriptionOutputSchema},
  prompt: `You are an expert marketing copywriter specializing in creating irresistible and appetizing descriptions for street food menu items. Your goal is to write a description that makes customers crave the dish and boosts sales.

Consider the following details about the dish:

Dish Name: "{{{dishName}}}"
{{#if ingredients}}Key Ingredients: {{{ingredients}}}{{/if}}
{{#if cuisineType}}Cuisine Type: {{{cuisineType}}}{{/if}}
{{#if tasteProfile}}Taste Profile: {{{tasteProfile}}}{{/if}}
{{#if targetAudience}}Target Audience: {{{targetAudience}}}{{/if}}

{{#if keywordsToInclude}}Ensure the description includes these keywords/phrases: {{{keywordsToInclude}}}{{/if}}
{{#if keywordsToExclude}}Avoid using these keywords/phrases: {{{keywordsToExclude}}}{{/if}}

Write a concise, engaging, and mouth-watering description (2-4 sentences) that highlights the unique flavors, textures, and experience of this dish. Focus on evocative language that appeals to the senses.
`,
});

// Define the flow
const generateDishDescriptionFlow = ai.defineFlow(
  {
    name: 'generateDishDescriptionFlow',
    inputSchema: GenerateDishDescriptionInputSchema,
    outputSchema: GenerateDishDescriptionOutputSchema,
  },
  async (input) => {
    const {output} = await generateDishDescriptionPrompt(input);
    return output!;
  }
);

// Export wrapper function
export async function generateDishDescription(
  input: GenerateDishDescriptionInput
): Promise<GenerateDishDescriptionOutput> {
  return generateDishDescriptionFlow(input);
}
