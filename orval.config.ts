import { defineConfig } from 'orval';

export default defineConfig({
  pegaApi: {
    input: {
      target: './docs/pega-api-v1-openapi3.json'
    },
    output: {
      mode: 'tags-split',
      target: './src/api/generated/endpoints',
      schemas: './src/api/generated/model',
      client: 'react-query',
      override: {
        mutator: {
          path: './src/api/mutator/custom-fetch.ts',
          name: 'customFetch'
        }
      }
    }
  }
});
