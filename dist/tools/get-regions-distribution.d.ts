import { z } from "zod";
export declare const getRegionsDistributionSchema: {
    phrase: z.ZodString;
    region: z.ZodDefault<z.ZodEnum<["REGION_ALL", "REGION_CITIES", "REGION_REGIONS"]>>;
    devices: z.ZodOptional<z.ZodArray<z.ZodEnum<["DEVICE_ALL", "DEVICE_DESKTOP", "DEVICE_PHONE", "DEVICE_TABLET"]>, "many">>;
};
export declare function getRegionsDistribution(params: z.infer<z.ZodObject<typeof getRegionsDistributionSchema>>): Promise<string>;
