const {expect, iit, idescribe, nit, ndescribe, ddescribe} = require('bdd-test-helper');

const {join} = require('./util');

describe('test-RegExp', () => {
    it('should match', () => {
        expect(join('abab'.match(/ab*/))).to.equal('ab', "'abab'.match(/ab*/)");
        expect(join('abab'.match(/(ab)*/))).to.equal('abab ab', "'abab'.match(/ab*/)");
    });
});
