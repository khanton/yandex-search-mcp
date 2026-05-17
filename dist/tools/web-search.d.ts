import { z } from "zod";
export declare const webSearchSchema: {
    query: z.ZodString;
    numResults: z.ZodDefault<z.ZodNumber>;
    page: z.ZodDefault<z.ZodNumber>;
    searchType: z.ZodDefault<z.ZodEnum<["SEARCH_TYPE_RU", "SEARCH_TYPE_COM_EN"]>>;
    region: z.ZodOptional<z.ZodString>;
};
export declare function webSearch(params: z.infer<z.ZodObject<typeof webSearchSchema>>): Promise<string>;
