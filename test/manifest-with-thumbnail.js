var expect = require('chai').expect;
var manifesto = require('../dist/server/manifesto');
var should = require('chai').should();
var manifests = require('./fixtures/manifests');
require('./shared');

var manifest;

describe('manifest thumbnail', function() {

    beforeEach(function(done) {
      manifesto.loadManifest(manifests.manifestwiththumbnail).then(function(data) {
        manifest = manifesto.create(data);
        done()
      });
    });
    
    it('can find thumbnail', function () {
        const thumbnail = manifest.getThumbnail();
        expect(thumbnail).to.exist;
    });

    it('has correct id', function () {
        const thumbnail = manifest.getThumbnail();
        expect(thumbnail.id).to.equal('http://example.org/images/book1-page1/full/80,100/0/default.jpg');
    });

    it('has correct type', function () {
        const thumbnail = manifest.getThumbnail();
        var type = thumbnail.getType();
        expect(type.toString()).to.equal('image');
    });

    it('has correct dimensions', function () {
        const thumbnail = manifest.getThumbnail();
        var width = thumbnail.getWidth();
        expect(width).to.equal(90);

        var height = thumbnail.getHeight();
        expect(height).to.equal(100);
    });
});