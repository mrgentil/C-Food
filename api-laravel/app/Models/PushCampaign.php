<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PushCampaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'body',
        'target_audience', // 'all', 'clients', 'drivers', 'merchants'
        'sent_count',
        'status', // 'draft', 'sent', 'failed'
    ];
}
