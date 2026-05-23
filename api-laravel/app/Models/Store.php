<?php

namespace App\Models;

/**
 * Store (merchant) model.
 *
 * Note: We keep the underlying table name `restaurants` for now to avoid
 * a risky DB rename. This class is the "clean" domain name used by the app.
 */
class Store extends Restaurant
{
    protected $table = 'restaurants';
}

