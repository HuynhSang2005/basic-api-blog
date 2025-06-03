import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const SearchSuggestionSchema = z.object({
  title: z.string(),
  slug: z.string(),
})

export type SearchSuggestionType = z.infer<typeof SearchSuggestionSchema>

export class SearchSuggestionDto extends createZodDto(z.array(SearchSuggestionSchema)) {}