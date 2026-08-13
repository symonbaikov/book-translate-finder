import { InMemoryEditionRepository } from '../fakes/in-memory-edition-repository.js';
import { runEditionRepositoryContractTests } from './edition-repository.contract-suite.js';

runEditionRepositoryContractTests(() => new InMemoryEditionRepository());
