 

            const encoder = new TextEncoder(); 
            const temp = encoder.encode("hello world"); // the message to encrypt

            const iv = crypto.getRandomValues(new Uint8Array(12));

            const simpleMessage = await crypto.subtle.encrypt(
              {
                name: "AES-GCM",
                iv: iv,
              },
              key, // the CryptoKey you have
              temp
            );
        crypto.subtle.decrypt(
              {
                name: "AES-GCM",
                iv: data.iv, // use the exact same IV you used for encryption
              },
              key,
              data.simpleMessage
            ).then((decrypted)=>{
              const varun = new TextDecoder().decode(decrypted)
              console.log(varun)
            })