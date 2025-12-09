import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(() => {
    controller = new AppController();
  });

  describe('getEntryPoint', () => {
    it('should return entry point with HATEOAS links', () => {
      const result = controller.getEntryPoint();
      expect(result._links).toBeDefined();
      expect(result._links.self).toEqual({ href: '/', method: 'GET' });
      expect(result._links.turntable).toEqual({ href: '/turntable', method: 'GET' });
    });
  });
});

