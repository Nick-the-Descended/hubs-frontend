<script lang="ts">
    import { page } from '$app/state';

    let categoryId = $state(page.params.categoryId);
    let subCategoryId = $state(page.params.subCategoryId);
</script>

<div class="container">
    <h1>Category: {categoryId} / {subCategoryId}</h1>
    <!-- Add your subcategory products listing here -->
</div>
