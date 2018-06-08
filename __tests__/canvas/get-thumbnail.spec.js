const manifesto = require('../../dist/server/manifesto');
const manifestJson = require('./fixtures/get-thumbnail-manifest');

describe('canvas.getThumbnail', function() {
  const manifest = manifesto.create(manifestJson);

  describe('Portrait aspect canvas. The canvas has a thumbnail resource, and the thumbnail resource has a level0 image service with inline sizes', function () {
    it('should load exact match request', function(done) {
      const canvas = manifest.getSequenceByIndex(0).getCanvasById('http://wellcomelibrary.org/iiif/b21068811/canvas/c6');

      canvas.getThumbnailAtSize({
        width: 62,
        height: 100
      }).then(function(thumbnail) {
        expect(thumbnail.width).toEqual(62);
        expect(thumbnail.height).toEqual(100);
        expect(thumbnail.actualWidth).toEqual(62);
        expect(thumbnail.actualHeight).toEqual(100);
        expect(thumbnail.scale).toEqual(1);
        expect(thumbnail.url).toEqual('https://dlcs.io/thumbs/wellcome/1/af0634e1-cf36-4290-b7bd-a7ed8699f42d/full/62,100/0/default.jpg');
        done();
      });
    });

    it('should fuzzy match - small', function(done) {
      const canvas = manifest.getSequenceByIndex(0).getCanvasById('http://wellcomelibrary.org/iiif/b21068811/canvas/c6');

      canvas.getThumbnailAtSize({
        width: 100,
        height: 110
      }).then(function(thumbnail) {
        expect(thumbnail.width).toEqual(68);
        expect(thumbnail.height).toEqual(110);
        expect(thumbnail.actualWidth).toEqual(62);
        expect(thumbnail.actualHeight).toEqual(100);
        expect(thumbnail.scale).toEqual(0.91);
        expect(thumbnail.url).toEqual('https://dlcs.io/thumbs/wellcome/1/af0634e1-cf36-4290-b7bd-a7ed8699f42d/full/62,100/0/default.jpg');
        done();
      });
    })

    it('should fuzzy match - larger, less accurate', function(done) {
      const canvas = manifest.getSequenceByIndex(0).getCanvasById('http://wellcomelibrary.org/iiif/b21068811/canvas/c6');

      canvas.getThumbnailAtSize({
        width: 300,
        height: 300
      }).then(function(thumbnail) {
        expect(thumbnail.width).toEqual(185);
        expect(thumbnail.height).toEqual(300);
        expect(thumbnail.actualWidth).toEqual(246);
        expect(thumbnail.actualHeight).toEqual(400);
        expect(thumbnail.scale).toEqual(1.33);
        expect(thumbnail.url).toEqual('https://dlcs.io/thumbs/wellcome/1/af0634e1-cf36-4290-b7bd-a7ed8699f42d/full/246,400/0/default.jpg');
        done();
      });
    });

    it('should crop width in portrait thumbnail when requesting square', function(done) {
      const canvas = manifest.getSequenceByIndex(0).getCanvasById('http://wellcomelibrary.org/iiif/b21068811/canvas/c6');

      canvas.getThumbnailAtSize({
        width: 1000,
        height: 1000
      }).then(function(thumbnail) {
        expect(thumbnail.width).toEqual(615);
        expect(thumbnail.height).toEqual(1000);
        expect(thumbnail.actualWidth).toEqual(630);
        expect(thumbnail.actualHeight).toEqual(1024);
        expect(thumbnail.scale).toEqual(1.02);
        expect(thumbnail.url).toEqual('https://dlcs.io/thumbs/wellcome/1/af0634e1-cf36-4290-b7bd-a7ed8699f42d/full/630,1024/0/default.jpg');
        done();
      });
    });
  });

  describe('Landscape aspect canvas. The canvas has a thumbnail resource, and the thumbnail resource has a level0 image service with inline sizes. getThumbnail(..) will use one of these sizes if it can.', () => {

    it('should load exact match request', function(done) {
      const canvas = manifest.getSequenceByIndex(0).getCanvasById('http://wellcomelibrary.org/iiif/b21522431/canvas/c46');
      canvas.getThumbnailAtSize({
        width: 200,
        height: 77
      }).then(function(thumbnail) {
        expect(thumbnail.width).toEqual(200);
        expect(thumbnail.height).toEqual(77);
        expect(thumbnail.actualWidth).toEqual(200);
        expect(thumbnail.actualHeight).toEqual(77);
        expect(thumbnail.scale).toEqual(1);
        expect(thumbnail.url).toEqual('https://dlcs.io/thumbs/wellcome/1/0791d344-2716-463f-b21f-cf38ef3d5592/full/200,77/0/default.jpg');
        done();
      });
    });

    it('should crop height in landscape thumbnail when requesting square', function(done) {
      const canvas = manifest.getSequenceByIndex(0).getCanvasById('http://wellcomelibrary.org/iiif/b21522431/canvas/c46');
      canvas.getThumbnailAtSize({
        width: 500,
        height: 500
      }).then(function(thumbnail) {
        expect(thumbnail.width).toEqual(500);
        expect(thumbnail.height).toEqual(191);
        expect(thumbnail.actualWidth).toEqual(400);
        expect(thumbnail.actualHeight).toEqual(153);
        expect(thumbnail.scale).toEqual(0.8);
        expect(thumbnail.url).toEqual('https://dlcs.io/thumbs/wellcome/1/0791d344-2716-463f-b21f-cf38ef3d5592/full/400,153/0/default.jpg');
        done();
      });
    });
  })

  describe('The canvas has a thumbnail property, and it\'s an image resource with a height and width. There is no image service on the thumbnail.getThumbnail(..) will use this image resource if it is between min and max.', () => {

    it('should load exact match request', function(done) {
      const canvas = manifest.getSequenceByIndex(0).getCanvasById('http://wellcomelibrary.org/iiif/b14658197/canvas/c1');
      canvas.getThumbnailAtSize({
        width: 100,
        height: 62
      }).then(function(thumbnail) {
        expect(thumbnail.width).toEqual(100);
        expect(thumbnail.height).toEqual(62);
        expect(thumbnail.actualWidth).toEqual(100);
        expect(thumbnail.actualHeight).toEqual(62);
        expect(thumbnail.scale).toEqual(1);
        expect(thumbnail.url).toEqual('https://dlcs.io/thumbs/wellcome/1/8ac70935-b55b-4c6f-89ca-33e6ab9bb161/full/100,62/0/default.jpg');
        done();
      });
    });

    it('should not load the thumbnail if out of bounds', function(done) {
      const canvas = manifest.getSequenceByIndex(0).getCanvasById('http://wellcomelibrary.org/iiif/b14658197/canvas/c1');
      canvas.getThumbnailAtSize({
        width: 300,
        height: 300,
        minWidth: 200,
        minHeight: 200,
      }).then(function(thumbnail) {
        expect(thumbnail.width).toEqual(300);
        expect(thumbnail.height).toEqual(185);
        expect(thumbnail.actualWidth).toEqual(1024);
        expect(thumbnail.actualHeight).toEqual(631);
        expect(thumbnail.scale).toEqual(3.41);
        expect(thumbnail.url).toEqual('https://dlcs.io/iiif-img/wellcome/1/8ac70935-b55b-4c6f-89ca-33e6ab9bb161/full/!1024,1024/0/default.jpg');
        done();
      });
    });

  });

  describe('The canvas has a thumbnail property, but it\'s a plain string url so we don\'t know how big it is.', function() {
    it('should match request', function(done) {
      const canvas = manifest.getSequenceByIndex(0).getCanvasById('http://wellcomelibrary.org/iiif/b14658197/canvas/c5');
      canvas.getThumbnailAtSize({
        width: 500,
        height: 500,
      }).then(function(thumbnail) {
        expect(thumbnail.width).toEqual(500);
        expect(thumbnail.height).toEqual(308);
        expect(thumbnail.actualWidth).toEqual(5346);
        expect(thumbnail.actualHeight).toEqual(3294);
        expect(thumbnail.scale).toEqual(10.69);
        expect(thumbnail.url).toEqual('john-dee-100px.jpg');
        done();
      });
    });

    it('should match request with max height set with unknown size', function(done) {
      const canvas = manifest.getSequenceByIndex(0).getCanvasById('http://wellcomelibrary.org/iiif/b14658197/canvas/c5');
      canvas.getThumbnailAtSize({
        width: 500,
        height: 500,
        maxHeight: 1200,
      }).then(function(thumbnail) {

        expect(thumbnail.width).toEqual(500);
        expect(thumbnail.height).toEqual(308);
        expect(thumbnail.actualWidth).toEqual(1024);
        expect(thumbnail.actualHeight).toEqual(631);
        expect(thumbnail.scale).toEqual(2.05);
        done();
      });
    });
  });

  describe('The canvas does not have a thumbnail property, the first image resource has a level 1 service. getThumbnail can only use this', function() {

    it('should match request', function(done) {
      const canvas = manifest.getSequenceByIndex(0).getCanvasById('http://wellcomelibrary.org/iiif/b14658197/canvas/c3');
      canvas.getThumbnailAtSize({
        width: 500,
        height: 500,
      }).then(function(thumbnail) {
        expect(thumbnail.width).toEqual(500);
        expect(thumbnail.height).toEqual(308);
        expect(thumbnail.actualWidth).toEqual(1024);
        expect(thumbnail.actualHeight).toEqual(631);
        expect(thumbnail.scale).toEqual(2.05);
        expect(thumbnail.url).toEqual('https://dlcs.io/iiif-img/wellcome/1/8ac70935-b55b-4c6f-89ca-33e6ab9bb161/full/!1024,1024/0/default.jpg');
        done();
      });
    });
  });

  describe('can only use the canvas.thumbnail if follow is true. The image service is level0, so we can\'t construct a specific tile request without some further information about tiles.', function() {

    it('Should load the full image when follow is set to false', function(done) {
      const canvas = manifest.getSequenceByIndex(0).getCanvasById('https://data.getty.edu/museum/api/iiif/1487/canvas/main1');
      canvas.getThumbnailAtSize({
        width: 500,
        height: 500,
      }).then(function(thumbnail) {
        expect(thumbnail.width).toEqual(344);
        expect(thumbnail.height).toEqual(500);
        expect(thumbnail.actualWidth).toEqual(172);
        expect(thumbnail.actualHeight).toEqual(250);
        expect(thumbnail.scale).toEqual(0.5);
        expect(thumbnail.url).toEqual('https://data.getty.edu/museum/api/iiif/377212/full/172,250/0/default.jpg');
        done();
      });
    });

    // @todo follow=true example
  });

  describe('There is no thumbnail at all! The image service is level0, so we can\'t construct a specific tile request without some further information about tiles.', function() {

    it('should read inline sizes', function(done) {
      const canvas = manifest.getSequenceByIndex(0).getCanvasById('https://data.getty.edu/museum/api/iiif/1487/canvas/main2');
      canvas.getThumbnailAtSize({
        width: 500,
        height: 500,
      }).then(function(thumbnail) {
        expect(thumbnail.width).toEqual(344);
        expect(thumbnail.height).toEqual(500);
        expect(thumbnail.actualWidth).toEqual(529);
        expect(thumbnail.actualHeight).toEqual(768);
        expect(thumbnail.scale).toEqual(1.54);
        expect(thumbnail.url).toEqual('https://data.getty.edu/museum/api/iiif/377212/full/529,768/0/default.jpg');
        done();
      });
    });
    // @todo follow=true example
  });

  describe('Level 0 only, but inline tiles on image service', function() {
    it('should only read inline tiles', function(done) {
      const canvas = manifest.getSequenceByIndex(0).getCanvasById('https://data.getty.edu/museum/api/iiif/1487/canvas/main3');
      canvas.getThumbnailAtSize({
        width: 500,
        height: 500,
      }).then(function(thumbnail) {
        expect(thumbnail.width).toEqual(344);
        expect(thumbnail.height).toEqual(500);
        expect(thumbnail.actualWidth).toEqual(175);
        expect(thumbnail.actualHeight).toEqual(254);
        expect(thumbnail.scale).toEqual(0.51);
        expect(thumbnail.url).toEqual('https://data.getty.edu/museum/api/iiif/377212/full/175,/0/default.jpg');
        done();
      });
    });
  });

  describe('Level 0 only, but inline tiles on image service but the wrong size', function() {
    it('should read inline tiles but not use them', function(done) {
      const canvas = manifest.getSequenceByIndex(0).getCanvasById('https://data.getty.edu/museum/api/iiif/1487/canvas/main4');
      canvas.getThumbnailAtSize({
        width: 500,
        height: 500,
      }).then(function(thumbnail) {
        expect(thumbnail.width).toEqual(345);
        expect(thumbnail.height).toEqual(500);
        expect(thumbnail.actualWidth).toEqual(3105);
        expect(thumbnail.actualHeight).toEqual(4504);
        expect(thumbnail.scale).toEqual(9.01);
        expect(thumbnail.url).toEqual('https://data.getty.edu/museum/api/iiif/377212/full/3105,4504/0/default.jpg');
        done();
      });
    });
  });
});