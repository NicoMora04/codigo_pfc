// ======================================================
// ADAPTER BASE PARA ALMACENAMIENTO DE IMÁGENES
// ======================================================
//
// Define el contrato que deberá cumplir cualquier
// proveedor externo de almacenamiento de imágenes.
//
// PostgreSQL no almacena los archivos binarios.
// Solo conservará la URL HTTPS y sus metadatos.
// ======================================================

class ImageStorageAdapter {

  async guardarImagen() {
    throw new Error(
      'guardarImagen debe ser implementado por el proveedor de almacenamiento'
    );
  }


  async eliminarImagen() {
    throw new Error(
      'eliminarImagen debe ser implementado por el proveedor de almacenamiento'
    );
  }

}


module.exports = ImageStorageAdapter;