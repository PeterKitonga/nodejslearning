let custom = {
    initDeleteProduct(btn, product_id, csrf_token) {
        const product = btn.closest('article');

        fetch(`/admin/products/delete/${product_id}`, { 
            method: 'DELETE',
            headers: {
                'CSRF-Token': csrf_token
            }
        })
        .then(response => {
            return response;
        })
        .then(data => {
            product.parentNode.removeChild(product);
        })
        .catch(err => console.log(result));
    }
};