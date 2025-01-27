/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest', // Permite usar TypeScript
  testEnvironment: 'jsdom', // Simula un DOM para pruebas de React
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Configuración de testing library
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock para archivos de estilos
    '^@/(.*)$': '<rootDir>/src/$1', // Alias de módulos (opcional, ajusta según tu proyecto)
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest', // Transformación para archivos TypeScript
  },
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'], // Archivos de prueba
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'], // Cobertura opcional
};
