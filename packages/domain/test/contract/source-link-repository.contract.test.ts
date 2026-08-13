import { InMemorySourceLinkRepository } from '../fakes/in-memory-source-link-repository.js';
import { runSourceLinkRepositoryContractTests } from './source-link-repository.contract-suite.js';

runSourceLinkRepositoryContractTests(() => new InMemorySourceLinkRepository());
