import { z } from "zod";
export declare const getTopSchema: {
    phrase: z.ZodString;
    numPhrases: z.ZodDefault<z.ZodNumber>;
    regions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    devices: z.ZodOptional<z.ZodArray<z.ZodEnum<["DEVICE_ALL", "DEVICE_DESKTOP", "DEVICE_PHONE", "DEVICE_TABLET"]>, "many">>;
};
export declare function getTop(params: z.infer<z.ZodObject<typeof getTopSchema>>): Promise<string>;
