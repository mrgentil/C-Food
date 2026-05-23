@php
    use App\Support\AdminDocumentUrl;
    use App\Support\DriverVerification;
    $vStatus = $user->driver_verification_status ?? DriverVerification::STATUS_PENDING;
    $badge = match ($vStatus) {
        DriverVerification::STATUS_APPROVED => 'bg-green-100 text-green-800 border-green-200',
        DriverVerification::STATUS_REJECTED => 'bg-red-100 text-red-800 border-red-200',
        default => 'bg-amber-100 text-amber-900 border-amber-200',
    };
    $docs = [
        'license' => ['label' => 'Permis de conduire', 'raw' => $user->driver_license_url, 'file' => 'license_file', 'field' => 'driver_license_url'],
        'insurance' => ['label' => 'Assurance véhicule', 'raw' => $user->driver_insurance_url, 'file' => 'insurance_file', 'field' => 'driver_insurance_url'],
        'id' => ['label' => 'Pièce d\'identité', 'raw' => $user->driver_id_url, 'file' => 'id_file', 'field' => 'driver_id_url'],
    ];
    $hasAnyDoc = collect($docs)->contains(fn ($d) => filled($d['raw']));
@endphp

<div id="driver-verification" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 scroll-mt-24">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
            <h3 class="text-lg font-semibold text-gray-900">Vérification livreur</h3>
            <p class="text-sm text-gray-500 mt-1">
                Fichiers envoyés depuis l'app driver (Mon véhicule) ou ajoutés ici.
            </p>
        </div>
        <span class="px-3 py-1 rounded-full text-sm font-semibold border {{ $badge }}">
            {{ DriverVerification::label($vStatus) }}
        </span>
    </div>

    @if(!$hasAnyDoc)
        <div class="mb-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 text-sm">
            Aucun document enregistré pour ce livreur. Demandez-lui d'ouvrir l'app → <strong>Mon véhicule</strong>
            et de téléverser permis + assurance, puis <strong>rafraîchissez cette page</strong>.
        </div>
    @endif

    <dl class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-6">
        <div><span class="text-gray-500">Ville :</span> <strong>{{ $user->city ?? '—' }}</strong></div>
        <div><span class="text-gray-500">Véhicule :</span> <strong>{{ $user->vehicle_type ?? '—' }}</strong></div>
        <div><span class="text-gray-500">Plaque :</span> <strong>{{ $user->plate_number ?? '—' }}</strong></div>
        <div><span class="text-gray-500">En ligne :</span> <strong>{{ $user->is_online ? 'Oui' : 'Non' }}</strong></div>
        @if($user->driver_verified_at)
            <div class="sm:col-span-2"><span class="text-gray-500">Vérifié le :</span> {{ $user->driver_verified_at->format('d/m/Y H:i') }}</div>
        @endif
    </dl>

    <form method="POST" action="{{ route('admin.users.driverVerification', $user) }}" enctype="multipart/form-data" class="space-y-6">
        @csrf

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            @foreach($docs as $key => $doc)
                @php($displayUrl = AdminDocumentUrl::display($doc['raw']))
                <div class="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                    <p class="text-sm font-semibold text-gray-900 mb-2">{{ $doc['label'] }}</p>

                    @if($displayUrl)
                        <a href="{{ $displayUrl }}" target="_blank" rel="noopener noreferrer"
                           class="inline-flex items-center gap-1 text-sm font-semibold text-orange-700 hover:text-orange-900 mb-2">
                            Ouvrir le document ↗
                        </a>
                        <a href="{{ $displayUrl }}" target="_blank" rel="noopener noreferrer" class="block mb-2">
                            <img src="{{ $displayUrl }}" alt="{{ $doc['label'] }}"
                                 class="w-full max-h-48 object-contain rounded-lg border border-gray-200 bg-white"
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                            <p class="hidden text-xs text-amber-700 bg-amber-50 p-2 rounded">
                                Aperçu indisponible — utilisez « Ouvrir le document ».
                            </p>
                        </a>
                    @else
                        <p class="text-xs text-red-600 font-medium mb-2">Non fourni par le livreur</p>
                    @endif

                    <label class="block text-xs text-gray-500 mb-1">URL (Cloudinary / stockage)</label>
                    <input type="url" name="{{ $doc['field'] }}"
                           value="{{ old($doc['field'], $doc['raw'] ?? '') }}"
                           placeholder="https://..."
                           class="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">

                    <label class="block text-xs text-gray-500 mb-1">Ou remplacer par un fichier (admin)</label>
                    <input type="file" name="{{ $doc['file'] }}" accept="image/*"
                           class="w-full text-sm text-gray-600 bg-white">
                </div>
            @endforeach
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Note admin (visible par le livreur si refus)</label>
            <textarea name="driver_verification_note" rows="3"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm">{{ old('driver_verification_note', $user->driver_verification_note) }}</textarea>
        </div>

        <div class="flex flex-wrap gap-3">
            <button type="submit" name="action" value="save"
                    class="inline-flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 font-semibold py-2 px-5 rounded-lg text-sm">
                Enregistrer les documents
            </button>
            <button type="submit" name="action" value="approve"
                    class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-lg text-sm"
                    onclick="return confirm('Approuver ce livreur ?');">
                Approuver le livreur
            </button>
            <button type="submit" name="action" value="reject"
                    class="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-lg text-sm"
                    onclick="return confirm('Refuser ce dossier ?');">
                Refuser
            </button>
        </div>
    </form>
</div>
