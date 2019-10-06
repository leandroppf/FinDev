# FinDev-API
API desenvolvida como Trabalho de Conclusão de Curso Ciência da Computação - UNIP 2019

Primeiro passo, abra o terminal e digite <b>yarn</b> para carregar as dependências.
  <br/>Obs.: A pasta node_modules será criada com as dependências.

<b>IMPORTANTE</b><br/>
No projeto foi utilizada a criptografia bcrypt, com algumas modificações nas funções hash e compareSync. Para funcionar corretamente, 
abra o arquivo node_modules/bcryptjs/dist/bcrypt.js e em seguida:
    
   Substitua a função hash por:
    
     /**
     * Asynchronously generates a hash for the given string.
     * @param {string} s String to hash
     * @param {number|string} salt Salt length to generate or salt to use
     * @param {string} mail
     * @param {function(Error, string=)=} callback Callback receiving the error, if any, and the resulting hash
     * @param {function(number)=} progressCallback Callback successively called with the percentage of rounds completed
     *  (0.0 - 1.0), maximally once per `MAX_EXECUTION_TIME = 100` ms.
     * @returns {!Promise} If `callback` has been omitted
     * @throws {Error} If `callback` is present but not a function
     * @expose
     */
    bcrypt.hash = function(s, salt, mail, callback, progressCallback) {
        if(mail){
            var splitedMail = mail.split('@');
            var pass = s;
            s = splitedMail[0] + pass + splitedMail[1]
        }

        function _async(callback) {
            if (typeof s === 'string' && typeof salt === 'number')
                bcrypt.genSalt(salt, function(err, salt) {
                    _hash(s, salt, callback, progressCallback);
                });
            else if (typeof s === 'string' && typeof salt === 'string')
                _hash(s, salt, callback, progressCallback);
            else
                nextTick(callback.bind(this, Error("Illegal arguments: "+(typeof s)+', '+(typeof salt))));
        }

        if (callback) {
            if (typeof callback !== 'function')
                throw Error("Illegal callback: "+typeof(callback));
            _async(callback);
        } else
            return new Promise(function(resolve, reject) {
                _async(function(err, res) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(res);
                });
            });
    };
   
   Em seguida substitua a função compareSync por:
   
    /**
     * Synchronously tests a string against a hash.
     * @param {string} s String to compare
     * @param {string} hash Hash to test against
     * @param {string} mail
     * @returns {boolean} true if matching, otherwise false
     * @throws {Error} If an argument is illegal
     * @expose
     */
    bcrypt.compareSync = function(s, hash, mail) {
        if(mail){
            var splitedMail = mail.split('@');
            var pass = s;
            s = splitedMail[0] + pass + splitedMail[1]
        }
        
        if (typeof s !== "string" || typeof hash !== "string")
            throw Error("Illegal arguments: "+(typeof s)+', '+(typeof hash));
        if (hash.length !== 60)
            return false;
        return safeStringCompare(bcrypt.hashSync(s, hash.substr(0, hash.length-31)), hash);
    };
   
<b>OU Se quiser utilizar a bcrypt como é criada, siga os passos abaixo:</b>
  
  Abra o aquivo src/app/models/Dev.js
  
   Substitua a linha 49 por:<br/> 
        <b>this.password = await bcrypt.hash(this.password, 8);</b>
      
   E a linha 54 por:<br/>
        <b>return bcrypt.compareSync(password, this.password);</b>
