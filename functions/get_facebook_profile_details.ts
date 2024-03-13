import { IrisHttpClient, generateUniqueID } from "../default_functions";
import {
    FacebookDetailsClient, FacebookDetailScope
} from "../iris/IrisApiClient";

const credentials = require('../credentials.json');


let httpClient = new IrisHttpClient(credentials.api.username, credentials.api.key);

get_facebook_profile_details("https://www.facebook.com/zuck");
async function get_facebook_profile_details (p_facebook_profile_url: string) {
    const facebook_profile_url = p_facebook_profile_url;

    const scope: FacebookDetailScope = new FacebookDetailScope({
        subject: facebook_profile_url,
        basicInfo: true,
        checkins: true,
        workAndEducation: true
    });

    const client = new FacebookDetailsClient("https://iris.web-iq.com/api", httpClient);
    client.startDetailsInvestigation(scope)
        .then(res => {
            console.log(res);
            const execution_id = res.executionId;
            var iteration_count = 0;

            setTimeout(() => {
                get_result(client, execution_id, iteration_count);
            }, 5000);
        })
}

async function get_result (client, execution_id, iteration_count) {
    client.getDetailsResult(execution_id)
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