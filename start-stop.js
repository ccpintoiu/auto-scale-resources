
// Configuration & params
const MetalCloud = require("metal-cloud-sdk");
const JSONRPC = require("jsonrpc-bidirectional");

const strEndpointURL = "https://fullmetal.bigstep.com/api/";
const strAPIKey = ""; // the API key can be found in the interface myBigstep > Metal Cloud > API
const strEmail = "";// change to your email

const infrastructureID = ;
const instanceArrayID = ;

async function run()
{
    const bsi = await new MetalCloud.Clients.BSI(strEndpointURL);
    bsi.addPlugin(new JSONRPC.Plugins.Client.SignatureAdd(strAPIKey));

    // The client is now initialized and authenticated. You can now execute functions through the Metal Cloud API.
    const objInstanceArray = await bsi.instance_array_get(instanceArrayID);
    let bStopInstanceArray = false;
    let bStartInstanceArray = false;

    if(objInstanceArray.instance_array_service_status === MetalCloud.Constants.SERVICE_STATUS_ACTIVE)
    {
        await bsi.instance_array_stop(instanceArrayID);
        bStopInstanceArray = true;
    }
    else if(objInstanceArray.instance_array_service_status === MetalCloud.Constants.SERVICE_STATUS_STOPPED)
    {
        await bsi.instance_array_start(instanceArrayID);
        bStartInstanceArray = true;
    }

    if(bStartInstanceArray || bStopInstanceArray)
    {
        const objInfrastructure = await bsi.infrastructure_get(infrastructureID);

        if(objInfrastructure.infrastructure_operation.infrastructure_deploy_status !== MetalCloud.Constants.PROVISION_STATUS_ONGOING)
        {
            if(bStartInstanceArray)
            {
                await bsi.infrastructure_deploy(infrastructureID);
            }
            else if(bStopInstanceArray)
            {
                await bsi.infrastructure_deploy(infrastructureID, {
                    "hard_shutdown_after_timeout" : false,
                    "attempt_soft_shutdown" : true,
                    "soft_shutdown_timeout_seconds" : 180
                });
            }
        }
    }
}

run();
