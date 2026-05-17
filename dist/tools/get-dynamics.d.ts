import { z } from "zod";
export declare const getDynamicsSchema: {
    phrase: z.ZodString;
    period: z.ZodEnum<["PERIOD_DAILY", "PERIOD_WEEKLY", "PERIOD_MONTHLY"]>;
    fromDate: z.ZodString;
    toDate: z.ZodOptional<z.ZodString>;
    regions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    devices: z.ZodOptional<z.ZodArray<z.ZodEnum<["DEVICE_ALL", "DEVICE_DESKTOP", "DEVICE_PHONE", "DEVICE_TABLET"]>, "many">>;
};
export declare function getDynamics(params: z.infer<z.ZodObject<typeof getDynamicsSchema>>): Promise<string>;
