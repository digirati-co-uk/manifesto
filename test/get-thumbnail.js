var expect = require('chai').expect;
var manifesto = require('../dist/server/manifesto');
var should = require('chai').should();
var manifestJson = require('./fixtures/get-thumbnail-manifest');

describe('canvas.getThumbnail', function() {
  var manifest = manifesto.create(manifestJson);

  describe('Portrait aspect canvas. The canvas has a thumbnail resource, and the thumbnail resource has a level0 image service with inline sizes', function () {
    it('should load exact match request', function() {
      var canvas = manifest.getSequenceByIndex(0).getCanvasById('http://wellcomelibrary.org/iiif/b21068811/canvas/c6');

      var thumbnail = canvas.getThumbnailAtSize({
        width: 62,
        height: 100
      });

      expect(thumbnail.width).equal(62);
      expect(thumbnail.height).equal(100);
      expect(thumbnail.actualWidth).equal(62);
      expect(thumbnail.actualHeight).equal(100);
      expect(thumbnail.scale).equal(1);
      expect(thumbnail.url).equal('https://dlcs.io/thumbs/wellcome/1/af0634e1-cf36-4290-b7bd-a7ed8699f42d/full/62,100/0/default.jpg');
    });

    it('should fuzzy match - small', function() {
      var canvas = manifest.getSequenceByIndex(0).getCanvasById('http://wellcomelibrary.org/iiif/b21068811/canvas/c6');

      var thumbnail = canvas.getThumbnailAtSize({
        width: 100,
        height: 110
      });

      expect(thumbnail.width).equal(68);
      expect(thumbnail.height).equal(110);
      expect(thumbnail.actualWidth).equal(62);
      expect(thumbnail.actualHeight).equal(100);
      expect(thumbnail.scale).equal(0.91);
      expect(thumbnail.url).equal('https://dlcs.io/thumbs/wellcome/1/af0634e1-cf36-4290-b7bd-a7ed8699f42d/full/62,100/0/default.jpg');
    })

    it('should fuzzy match - larger, less accurate', function() {
      var canvas = manifest.getSequenceByIndex(0).getCanvasById('http://wellcomelibrary.org/iiif/b21068811/canvas/c6');

      var thumbnail = canvas.getThumbnailAtSize({
        width: 300,
        height: 300
      });

      expect(thumbnail.width).equal(185);
      expect(thumbnail.height).equal(300);
      expect(thumbnail.actualWidth).equal(246);
      expect(thumbnail.actualHeight).equal(400);
      expect(thumbnail.scale).equal(1.33);
      expect(thumbnail.url).equal('https://dlcs.io/thumbs/wellcome/1/af0634e1-cf36-4290-b7bd-a7ed8699f42d/full/246,400/0/default.jpg');
    });

    it('should crop width in portrait thumbnail when requesting square', function() {
      var canvas = manifest.getSequenceByIndex(0).getCanvasById('http://wellcomelibrary.org/iiif/b21068811/canvas/c6');

      var thumbnail = canvas.getThumbnailAtSize({
        width: 1000,
        height: 1000
      });

      expect(thumbnail.width).equal(615);
      expect(thumbnail.height).equal(1000);
      expect(thumbnail.actualWidth).equal(630);
      expect(thumbnail.actualHeight).equal(1024);
      expect(thumbnail.scale).equal(1.02);
      expect(thumbnail.url).equal('https://dlcs.io/thumbs/wellcome/1/af0634e1-cf36-4290-b7bd-a7ed8699f42d/full/630,1024/0/default.jpg');
    });
  });

  describe('Landscape aspect canvas. The canvas has a thumbnail resource, and the thumbnail resource has a level0 image service with inline sizes. getThumbnail(..) will use one of these sizes if it can.', () => {

    it('should load exact match request', function() {
      var canvas = manifest.getSequenceByIndex(0).getCanvasById('http://wellcomelibrary.org/iiif/b21522431/canvas/c46');
      var thumbnail = canvas.getThumbnailAtSize({
        width: 200,
        height: 77
      });

      expect(thumbnail.width).equal(200);
      expect(thumbnail.height).equal(77);
      expect(thumbnail.actualWidth).equal(200);
      expect(thumbnail.actualHeight).equal(77);
      expect(thumbnail.scale).equal(1);
      expect(thumbnail.url).equal('https://dlcs.io/thumbs/wellcome/1/0791d344-2716-463f-b21f-cf38ef3d5592/full/200,77/0/default.jpg');
    });

    it('should crop height in landscape thumbnail when requesting square', function() {
      var canvas = manifest.getSequenceByIndex(0).getCanvasById('http://wellcomelibrary.org/iiif/b21522431/canvas/c46');
      var thumbnail = canvas.getThumbnailAtSize({
        width: 500,
        height: 500
      });

      expect(thumbnail.width).equal(500);
      expect(thumbnail.height).equal(191);
      expect(thumbnail.actualWidth).equal(400);
      expect(thumbnail.actualHeight).equal(153);
      expect(thumbnail.scale).equal(0.8);
      expect(thumbnail.url).equal('https://dlcs.io/thumbs/wellcome/1/0791d344-2716-463f-b21f-cf38ef3d5592/full/400,153/0/default.jpg');
    });
  })

  describe('The canvas has a thumbnail property, and it\'s an image resource with a height and width. There is no image service on the thumbnail.getThumbnail(..) will use this image resource if it is between min and max.', () => {

    it('should load exact match request', function() {
      var canvas = manifest.getSequenceByIndex(0).getCanvasById('http://wellcomelibrary.org/iiif/b14658197/canvas/c1');
      var thumbnail = canvas.getThumbnailAtSize({
        width: 100,
        height: 62
      });

      expect(thumbnail.width).equal(100);
      expect(thumbnail.height).equal(62);
      expect(thumbnail.actualWidth).equal(100);
      expect(thumbnail.actualHeight).equal(62);
      expect(thumbnail.scale).equal(1);
      expect(thumbnail.url).equal('https://dlcs.io/thumbs/wellcome/1/8ac70935-b55b-4c6f-89ca-33e6ab9bb161/full/100,62/0/default.jpg');
    });

    it('should not load the thumbnail if out of bounds', function() {
      var canvas = manifest.getSequenceByIndex(0).getCanvasById('http://wellcomelibrary.org/iiif/b14658197/canvas/c1');
      var thumbnail = canvas.getThumbnailAtSize({
        width: 300,
        height: 300,
        minWidth: 200,
        minHeight: 200,
      });

      expect(thumbnail.width).equal(300);
      expect(thumbnail.height).equal(185);
      expect(thumbnail.actualWidth).equal(1024);
      expect(thumbnail.actualHeight).equal(631);
      expect(thumbnail.scale).equal(3.41);
      expect(thumbnail.url).equal('https://dlcs.io/iiif-img/wellcome/1/8ac70935-b55b-4c6f-89ca-33e6ab9bb161/full/!1024,1024/0/default.jpg');
    });

  });

  describe('The canvas has a thumbnail property, but it\'s a plain string url so we don\'t know how big it is.', function() {
    it('should match request', function() {
      var canvas = manifest.getSequenceByIndex(0).getCanvasById('http://wellcomelibrary.org/iiif/b14658197/canvas/c5');
      var thumbnail = canvas.getThumbnailAtSize({
        width: 500,
        height: 500,
      });

      expect(thumbnail.width).equal(500);
      expect(thumbnail.height).equal(308);
      expect(thumbnail.actualWidth).equal(5346);
      expect(thumbnail.actualHeight).equal(3294);
      expect(thumbnail.scale).equal(10.69);
      expect(thumbnail.url).equal('john-dee-100px.jpg');
    });

    it('should match request with max height set with unknown size', function() {
      var canvas = manifest.getSequenceByIndex(0).getCanvasById('http://wellcomelibrary.org/iiif/b14658197/canvas/c5');
      var thumbnail = canvas.getThumbnailAtSize({
        width: 500,
        height: 500,
        maxHeight: 1200,
      });

      expect(thumbnail.width).equal(500);
      expect(thumbnail.height).equal(308);
      expect(thumbnail.actualWidth).equal(1024);
      expect(thumbnail.actualHeight).equal(631);
      expect(thumbnail.scale).equal(2.05);
      expect(thumbnail.url).equal('https://dlcs.io/iiif-img/wellcome/1/8ac70935-b55b-4c6f-89ca-33e6ab9bb161/full/!1024,1024/0/default.jpg');
    });
  });

  describe('The canvas does not have a thumbnail property, the first image resource has a level 1 service. getThumbnail can only use this', function() {

    it('should match request', function() {
      var canvas = manifest.getSequenceByIndex(0).getCanvasById('http://wellcomelibrary.org/iiif/b14658197/canvas/c3');
      var thumbnail = canvas.getThumbnailAtSize({
        width: 500,
        height: 500,
      });

      expect(thumbnail.width).equal(500);
      expect(thumbnail.height).equal(308);
      expect(thumbnail.actualWidth).equal(1024);
      expect(thumbnail.actualHeight).equal(631);
      expect(thumbnail.scale).equal(2.05);
      expect(thumbnail.url).equal('https://dlcs.io/iiif-img/wellcome/1/8ac70935-b55b-4c6f-89ca-33e6ab9bb161/full/!1024,1024/0/default.jpg');
    });

  })
});