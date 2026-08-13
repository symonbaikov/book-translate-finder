import { InMemoryExternalRefRepository } from '../fakes/in-memory-external-ref-repository.js';
import { runExternalRefRepositoryContractTests } from './external-ref-repository.contract-suite.js';

runExternalRefRepositoryContractTests(() => new InMemoryExternalRefRepository());
