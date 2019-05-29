//import KJUR, {KEYUTIL} from 'jsrsasign';
import config from '../globalConfiguration.json';

export async function createToken(grant_type,user,username,password,login=false){
    const types = {
    error: "errorClass",
    info: "infoClass",
    debug: "debugClass",
    warning: "warningClass"
  };
    const tokenUrl = config.authorization_service.auth_token_url;
    console.log("Retrieving OAuth token from "+tokenUrl,types.info);
    let params={}
    if(login == true){
        params['grant_type'] = grant_type
        params['client_id'] = 'app-login'
        params['username'] = username
        params['password'] = password
    }
    else{
        if(grant_type == 'password'){
            params['grant_type'] = grant_type
            // if(user == 'provider'){
            //      params['client_id'] = config.provider.client_id
            // }
            // else{
            //     params['client_id'] = config.payer.client_id
            // }
            params['client_id'] = config.provider.client_id
            params['username'] = username
            params['password'] = password
        }
        else{
            params['grant_type'] = grant_type
            if(user == 'provider'){
                params['client_id'] = config.provider.client_id
                params['client_secret'] = config.provider.client_secret
            }
            else{
                params['client_id'] = config.payer.client_id
                params['client_secret'] = config.payer.client_secret
            }
        }

    }
    // let params = {
    //     grant_type:"password",
    //     username:username,
    //     password:password,
    //     client_id:config.provider.client_id
    //   };
    if(config.provider.client_id){
    console.log("Using client {" + config.provider.client_id + "}",types.info)
    }else{
    console.log("No client id provided in GlobalConfiguration",this.warning);
    }

    // Encodes the params to be compliant with
    // x-www-form-urlencoded content types.
    // console.log(params,'params  ')
    const searchParams = Object.keys(params).map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    }).join('&');
    // We get the token from the url
    const tokenResponse =  await fetch(tokenUrl, {
        method: "POST",
        headers: {
            "Content-Type":"application/x-www-form-urlencoded"
          },
        body: searchParams
    })
    .then((response) =>{
        return response.json();
    })
    .then((response)=>{
        const token = response?response.access_token:null;
        if(token){
        console.log("Successfully retrieved token",types.info);
        }else{
        console.log("Failed to get token",types.warning);
        if(response.error_description){
            console.log(response.error_description,types.error);
        }
        }
        return token;

    })
    .catch(reason =>{
    console.log("Failed to get token", types.error,reason);
    console.log("Bad request");
    });
//    let t = await tokenResponse
    // console.log("tokenResponse:",t)
    return tokenResponse;

}