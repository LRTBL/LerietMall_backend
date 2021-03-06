const BaseService = require("./base.service");
const { CloudStorage } = require("../helpers");

let _productRepository = null;
let _businessRepository = null;
let _calificationService = null;

function _err(msg, code = 500) {
     const err = new Error();
     err.code = code;
     err.message = msg;
     throw err;
}
class ProductService extends BaseService {
     constructor({ ProductRepository, BusinessRepository, CalificationService }) {
          super(ProductRepository);
          _productRepository = ProductRepository;
          _businessRepository = BusinessRepository;
          _calificationService = CalificationService;
     }

     async saveImage(filename, id) {
          const productExist = await _productRepository.get(id);
          if (!productExist) {
               const error = new Error();
               error.status = 400;
               error.message = "Product does not found";
               throw error;
          }
          const urlImages = `${productExist.businessId}/products/${productExist._id}/${filename}`;
          await CloudStorage.saveImage(filename, urlImages);
          const { images } = productExist;
          images.push(urlImages);
          await _productRepository.update(id, { images });
          return true;
     }

     async create(productEntity) {
          const business = await _businessRepository.get(productEntity.businessId);
          if (!business || business?.inactive?.reason) {
               const error = new Error();
               error.status = 400;
               error.message = "Business does not found";
               throw error;
          }
          return _productRepository.create({ ...productEntity, category: business.category });
     }

     async get(idProduct) {
          let product = await _productRepository.get(idProduct);
          if (!product) {
               const error = new Error();
               error.status = 400;
               error.message = "Product does not found";
               throw error;
          }
          product = product.getHome();
          const business = await _businessRepository.get(product.businessId);

          const calification = await _calificationService.getProductCalification(idProduct);
          return { product: { ...product, businessName: business.name }, califications: calification };
     }

     async update(id, entity) {
          if (!id) _err("ID must be sent", 400);

          const productExists = await _productRepository.get(id);
          if (!productExists) _err("Product does not found", 400);

          const { businessId } = productExists;
          const business = await this.validate(businessId, true);

          if (entity.images) {
               const imagesDelete = productExists.images.filter((image) => !entity.images.includes(image));
               imagesDelete.forEach(async (urlImage) => {
                    await CloudStorage.deleteImage(urlImage);
               });
          }
          const { shipments: _sh } = business;
          if (entity.shipments) {
               const list = _sh.reduce(
                    (o, v) => ({
                         ...o,
                         [v.id]: true,
                    }),
                    {}
               );
               const shipments = [...new Set(entity.shipments)];
               const valid = shipments.reduce((o, v) => [...o, !!list[v]], []).filter((x) => x).length === shipments.length;

               if (!valid) _err("Invalid shipments codes", 500);
               entity.shipments = shipments;
          }
          return _productRepository.update(id, entity);
     }

     async delete(idProduct) {
          if (!idProduct) {
               const error = new Error();
               error.status = 400;
               error.message = "ID must be sent";
               throw error;
          }
          const productExists = await _productRepository.get(idProduct);
          if (!productExists) {
               const error = new Error();
               error.status = 400;
               error.message = "Product does not found";
               throw error;
          }
          if (productExists.images.length !== 0) {
               productExists.images.forEach(async (imageUrl) => {
                    await CloudStorage.deleteImage(imageUrl);
               });
          }
          await _productRepository.delete(idProduct);
          return true;
     }

     async getBySubCategory(subCategory, idBusiness) {
          return _productRepository.getBySubCategory(subCategory, idBusiness);
     }

     async getByCategory(category) {
          return _productRepository.getProductCategory(category);
     }

     async getByShipment(id, idBusiness) {
          return _productRepository.getByShipment(id, idBusiness);
     }

     async getProductsById(entity) {
          const { ids } = entity;
          if (!ids) {
               const error = new Error();
               error.status = 400;
               error.message = "ID products does not found";
               throw error;
          }
          const response = await ids.reduce(async (obj, item) => {
               const product = await _productRepository.get(item);
               return {
                    ...(await obj),
                    [item]: product,
               };
          }, {});
          return response;
     }

     async deleteByBusinessId(businessId) {
          const products = await _productRepository.getProductsByBusinessId(businessId);
          products.forEach((product) => {
               if (product.images.length !== 0) {
                    product.images.forEach(async (image) => {
                         await CloudStorage.deleteImage(image);
                         await _historyRepository.create({ ...product, type: "product" });
                    });
               }
          });
          await _productRepository.deleteProductsByBusinessId(businessId);
          return true;
     }

     async getAll() {
          return _productRepository.getAll();
     }

     async updateMany(id, from, to) {
          return _productRepository.updateManySubcategory(id, from, to);
     }

     async validate(id, object = false) {
          if (!id) _err("Id must be sent", 404);
          const business = await _businessRepository.get(id);
          if (!business) _err("Not found", 404);
          if (object) return business;
          return true;
     }
}

module.exports = ProductService;
