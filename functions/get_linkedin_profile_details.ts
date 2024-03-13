import { IrisHttpClient, generateUniqueID } from "../default_functions";
import {
    LinkedinDetailsClient, LinkedInDetailScope,
    //Graph, VertexReference    
} from "../iris/IrisApiClient";

const credentials = require('../credentials.json');

let httpClient = new IrisHttpClient(credentials.api.username, credentials.api.key);


//get_linkedin_profile_details("https://www.linkedin.com/in/david-nikolai-mueller");
async function get_linkedin_profile_details (p_linkedin_profile_url: string) {
    const linkedin_profile_url = p_linkedin_profile_url;

    const scope: LinkedInDetailScope = new LinkedInDetailScope({
        subject: linkedin_profile_url,
        basicInfo: true,
        work: true,
        education: true
    });

    const client: LinkedinDetailsClient = new LinkedinDetailsClient("https://iris.web-iq.com/api", httpClient);

    client.startDetailsInvestigation_1(scope)
        .then(res => {
            console.log(res);
            const execution_id = res.executionId;
            var iteration_count = 0;

            setTimeout(() => {
                get_result(client, execution_id, iteration_count);
            }, 5000);
        })
        .catch(err => {
            console.error('An error occurred.');
            console.error(err);
        })
}

async function get_result (client, execution_id, iteration_count) {
    
    client.getDetailsResult_1(execution_id)
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
            console.log(res.result);
        })
        .catch(err => {
            console.error(err);
        });

}