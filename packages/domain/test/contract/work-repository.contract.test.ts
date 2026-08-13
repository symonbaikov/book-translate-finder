import { InMemoryWorkRepository } from '../fakes/in-memory-work-repository.js';
import { runWorkRepositoryContractTests } from './work-repository.contract-suite.js';

runWorkRepositoryContractTests(() => new InMemoryWorkRepository());
