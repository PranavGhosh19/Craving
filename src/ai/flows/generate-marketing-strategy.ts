'use server';
/**
 * @fileOverview An AI assistant flow for generating creative marketing strategies and loyalty program ideas for street food vendors.
 *
 * - generateMarketingStrategy - A function that generates a marketing strategy.
 * - GenerateStrategyInput - The input type.
 * - GenerateStrategyOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStrategyInputSchema = z.object({
  businessName: z.string().describe('The name of the vendor stall.'),
  cuisine: z.string().optional().describe('Type of food served.'),
  goal: z.enum(['retention', 'new_customers', 'average_order_value']).describe('The primary goal of the strategy.'),
});
export type GenerateStrategyInput = z.infer<typeof GenerateStrategyInputSchema>;

const GenerateStrategyOutputSchema = z.object({
  strategyName: z.string().describe('A catchy name for the promotion or strategy.'),
  description: z.string().describe('An engaging description of how the strategy works and why customers will love it.'),
  suggestedLoyaltyType: z.enum(['BuyNGetMFree', 'PointsBased']).describe('The type of loyalty program to implement.'),
  suggestedBuyCount: z.number().optional().describe('Suggested number of items to buy to earn a reward.'),
});
export type GenerateStrategyOutput = z.infer<typeof GenerateStrategyOutputSchema>;

const generateStrategyPrompt = ai.definePrompt({
  name: 'generateStrategyPrompt',
  input: {schema: GenerateStrategyInputSchema},
  output: {schema: GenerateStrategyOutputSchema},
  prompt: `You are a street food marketing expert. 
  Create a compelling marketing strategy for a stall named "{{{businessName}}}" specializing in "{{{cuisine}}}".
  
  The vendor's goal is: {{#if (eq goal "retention")}}To keep existing customers coming back more often.{{else if (eq goal "new_customers")}}To attract people who haven't tried the food yet.{{else}}To encourage customers to spend more on each visit.{{/if}}
  
  Provide a catchy strategy name, a mouth-watering description for the customers, and recommend a specific loyalty program setup.
  `,
});

const generateStrategyFlow = ai.defineFlow(
  {
    name: 'generateStrategyFlow',
    inputSchema: GenerateStrategyInputSchema,
    outputSchema: GenerateStrategyOutputSchema,
  },
  async (input) => {
    const {output} = await generateStrategyPrompt(input);
    return output!;
  }
);

export async function generateMarketingStrategy(
  input: GenerateStrategyInput
): Promise<GenerateStrategyOutput> {
  return generateStrategyFlow(input);
}
