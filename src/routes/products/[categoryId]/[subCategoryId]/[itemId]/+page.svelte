<script lang="ts">
    import { page } from '$app/state';

    let categoryId = $state(page.params.categoryId);
    let subCategoryId = $state(page.params.subCategoryId);
    let itemId = $state(page.params.itemId);
</script>

<div class="container">
    <h1>Product Details</h1>
    <p>Category: {categoryId}</p>
    <p>Subcategory: {subCategoryId}</p>
    <p>Item ID: {itemId}</p>
    <!-- Add your product details here -->
</div>
