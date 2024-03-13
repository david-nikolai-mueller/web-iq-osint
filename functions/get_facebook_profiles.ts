import { IrisHttpClient, generateUniqueID } from "../default_functions";
import {
    PersonNameElement, Person, AnnotatedPersonName, PersonNameElementRole,
    Location, AnnotatedAddress, AddressElement, AddressElementRole, LocatedAt,
    Graph, VertexReference,
    FacebookProfileSearchScope, FacebookProfileSearchClient
} from "../iris/IrisApiClient";

const credentials = require('../credentials.json')

let httpClient = new IrisHttpClient(credentials.api.username, credentials.api.key);

//get_facebook_profile('David Nikolai', 'Müller', 'Germany', 'DE', 'Berlin');

async function get_facebook_profile (p_first_name: string, p_last_name: string, p_country_name: string, p_country_code: string, p_locality: string) {
    const person_id = generateUniqueID();
    const location_id = generateUniqueID();
    const first_name = p_first_name;
    const last_name = p_last_name;
    const country_name = p_country_name;
    const country_code = p_country_code;
    const locality = p_locality;

    const person = new Person();
    person.id = person_id;
    person.personName = [ new AnnotatedPersonName({
        value: [
            new PersonNameElement({
                role: PersonNameElementRole.GIVEN_NAME,
                value: first_name
            }),
            new PersonNameElement({
                role: PersonNameElementRole.FAMILY_NAME,
                value: last_name
            })
        ]
    })]

    const location = new Location();
    location.id = location_id;
    location.address = [ new AnnotatedAddress({
        value: [
            new AddressElement({
                role: AddressElementRole.COUNTRY_NAME,
                value: country_name
            }),
            new AddressElement({
                role: AddressElementRole.LOCALITY,
                value: locality
            })
        ]
    })]

    const locatedAt = new LocatedAt({
        start: person.id,
        destination: location.id
    });

    const graph = new Graph({
        vertices: [ person, location ],
        edges: [ locatedAt ]
    });

    const subject: VertexReference = new VertexReference();
    subject.vertex = person.id;

    let scope: FacebookProfileSearchScope = new FacebookProfileSearchScope({
        graph: graph,
        subject: subject,
        searchLimit: 5
    });

    let t_scope = JSON.stringify(scope);
    t_scope = t_scope.replaceAll('_discriminator', '_type');
    scope = JSON.parse(t_scope);

    const client: FacebookProfileSearchClient = new FacebookProfileSearchClient("https://iris.web-iq.com/api", httpClient);
    client.startFacebookProfileSearchInvestigation(scope)
        .then(res => {
            const execution_id = res.executionId;
            var iterate_count = 0;

            setTimeout(() => {
                iterate_get_result(client, execution_id, iterate_count);
            }, 5000)
        })
        .catch(err => {
            console.error(err);
        });   
}

async function iterate_get_result (client, execution_id, iterate_count) {
    client.getFacebookProfileSearchResult(execution_id)
        .then(res => {
            console.log(res);
            iterate_count++;
            if (res.result === undefined) {
                if (iterate_count > 5) {
                    console.log('Failed to get result');
                    return;
                } else {
                    setTimeout(() => {
                        iterate_get_result(client, execution_id, iterate_count);
                    }, 5000)
                    return;
                }
            }
            console.log(res.result.graph);
        })
        .catch(err => {
            console.error(err);
        });
}
  

//get_facebook_profile();