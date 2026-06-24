export class MemoryStore {

  save(context: any, result: any) {
    context.resources.searchResults =
      result?.searchResults ?? context.resources.searchResults;
  }
}