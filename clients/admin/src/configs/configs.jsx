export const isDev = (typeof __DEV__ !== "undefined" && __DEV__) || (typeof process !== "undefined" && process.env?.NODE_ENV === "development")

export const registry = [
    { app: "admin", env: "ops", path: "/etc/admin/config.json" },
    { app: "core", env: "test", path: "/etc/core/config.json" },
    { app: "core", env: "prod", path: "/etc/core/config.json" },
    { app: "logger", env: "test", path: "/etc/logger/config.json" },
    { app: "logger", env: "prod", path: "/etc/logger/config.json" },
    { app: "mailer", env: "test", path: "/etc/mailer/config.json" },
    { app: "mailer", env: "prod", path: "/etc/mailer/config.json" },
]

export const serviceBinaries = {
    admin: "ADMIN",
    core: "CORE",
    logger: "LOGGER",
    mailer: "MAILER",
}

export const serviceDescriptions = {
    admin: "Administration service for operations platform",
    core: "Core service for operations platform",
    logger: "Centralized logging service",
    mailer: "Asynchronous email delivery service",
}

export const getRegistryEntry = (app, env) => registry.find((item) => item.app === app && item.env === env)
