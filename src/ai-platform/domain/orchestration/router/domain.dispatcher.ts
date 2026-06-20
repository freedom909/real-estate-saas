import { Intent } from "../../semantic/extractors/intent.decision";

//
class DomainDispatcher {

  dispatch(intents: Intent[]) {

    const map = new Map<string, Intent[]>();

    for (const intent of intents) {

      const domain = intent.domain;

      if (!map.has(domain)) {
        map.set(domain, []);
      }

      map.get(domain)!.push(intent);
    }
    const result=Object.fromEntries(map);
    console.log("result+",result)
    return result
  }
}