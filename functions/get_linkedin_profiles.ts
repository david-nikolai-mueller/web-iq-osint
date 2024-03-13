import { IrisHttpClient, generateUniqueID } from "../default_functions";
import {
    Person, PersonNameElement, AnnotatedPersonName, PersonNameElementRole,
    Location, AnnotatedAddress, AddressElement, AddressElementRole, LocatedAt,
    Graph, VertexReference,
    LinkedInProfileSearchScope, LinkedinProfileSearchClient
} from "../iris/IrisApiClient";

const credentials = require('../credentials.json')


let httpClient = new IrisHttpClient(credentials.api.username, credentials.api.key);

get_linkedin_profile('David Nikolai', 'Müller', 'Germany', 'DE', 'Berlin');
async function get_linkedin_profile (p_first_name: string, p_last_name: string, p_country_name: string, p_country_code: string, p_locality: string) {
    const person_id = generateUniqueID() //"36c0b32e-99e2-4ba9-99df-0e6643334e61"; //generateUniqueID();
    const location_id = generateUniqueID() //"febcb519-a30b-4f56-8f8d-a567edb841b1"; // generateUniqueID();
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

    let scope: LinkedInProfileSearchScope = new LinkedInProfileSearchScope({
        graph: graph,
        subject: subject,
        searchLimit: 5
    });

    let t_scope = JSON.stringify(scope);
    t_scope = t_scope.replaceAll('_discriminator', '_type');
    scope = JSON.parse(t_scope);

    let client: LinkedinProfileSearchClient = new LinkedinProfileSearchClient("https://iris.web-iq.com/api", httpClient);
    client.startLinkedInProfileSearchInvestigation(scope)
        .then(res => {
            const execution_id = res.executionId;
            var iteration_count = 0;

            setTimeout(() => {
                get_result(client, execution_id, iteration_count);
            }, 5000);
        })
        .catch(err => {
            console.log(err);
        });
}


async function get_result (client, execution_id, iteration_count) {
    client.getLinkedInProfileSearchResult(execution_id)
        .then(res => {
            iteration_count++;
            if (res.result === undefined) {
                if (iteration_count > 5) {
                    console.log('No results');
                    return;
                } else {
                    console.log('No results yet');
                    setTimeout(() => {
                        get_result(client, execution_id, iteration_count);
                    }, 8000);
                    return;
                }
            }
            console.log(res.result.graph);
        })
        .catch(err => {
            console.error(err);
        });
}