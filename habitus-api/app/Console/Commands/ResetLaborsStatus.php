<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ResetLaborsStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:reset-labors-status';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset all labors status to pending';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        \App\Models\Labor::where('status', 'completed')->update(['status' => 'pending']);

        $this->info('All completed labors have been reset to pending.');
    }
}
