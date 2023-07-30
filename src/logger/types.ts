export type LoggerEvents = "Log" | "LogSilent" | "Warn" | "Error" | "Create";

export type LoggerEventHook = (arg: string) => boolean;
