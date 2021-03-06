const bn128 = require('./bn128.js'); 


const elgamal = {};

elgamal.MAX_PLAIN = 2**32 - 1;

elgamal.encrypt = (m, y, r) => {
    if (r === undefined)
        r = bn128.randomScalar(); 
    var CL = bn128.curve.g.mul(m).add(y.mul(r))
    var CR = bn128.curve.g.mul(r); 
    return [CL, CR];
};

/**
ct is an ElGamal ciphertext, x is a BN.
TODO: This could be slow if we don't provide an initial guess for the balance. Need to optimize.
*/
elgamal.decrypt = (ct, x) => {
    var CL = ct[0];
    var CR = ct[1];
    var gB = CL.add(CR.mul(x.redNeg()));

    var accumulator = bn128.zero;
    for (var i = 0; i < elgamal.MAX_PLAIN; i++) {
        if (accumulator.eq(gB)) {
            return i;
        }
        if (accumulator.neg().eq(gB)) {
            return -i;
        }
        accumulator = accumulator.add(bn128.curve.g);
    }
    throw "Unable to decrypt the ciphertext: " + ct;
};

elgamal.addPlain = (ct, plain) => {
    var cL = ct[0].add(bn128.curve.g.mul(plain));
    var cR = ct[1];
    return [cL, cR];
};

elgamal.subPlain = (ct, plain) => {
    return elgamal.addPlain(ct, -plain);
};

elgamal.serialize = (ct) => {
    return [bn128.serialize(ct[0]), bn128.serialize(ct[1])];
};

elgamal.unserialize = (serialized) => {
    return [bn128.unserialize(serialized[0]), bn128.unserialize(serialized[1])];
};

module.exports = elgamal;
