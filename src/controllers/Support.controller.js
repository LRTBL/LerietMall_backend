let _supportService = null;

class SupportController {
     constructor({ SupportService }) {
          _supportService = SupportService;
     }

     async createRequest(req, res) {
          const { body } = req;
          const result = await _supportService.createRequest(body);
          return res.send(result);
     }

     async listRequest(req, res) {
          const { body } = req;
          const result = await _supportService.listRequest(body);
          return res.send(result);
     }

     async searchRequest(req, res) {
          const { body } = req;
          const result = await _supportService.searchRequest(body);
          return res.send(result);
     }
     
     async uploadFile(req, res) {
          const {
               file:{filename},
               params: { id },
          } = req;
          const result = await _supportService.uploadFile(id, filename);
          return res.send(result);
     }

     async cancelRequest(req, res) {
          const { body } = req;
          const result = await _supportService.cancelRequest(body);
          return res.send(result);
     }
   
}

module.exports = SupportController;
