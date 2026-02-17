<?php

namespace App\Http\Controllers;

use App\Http\Requests\SignupRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        /**
         $user = Schema::getColumnListing((new User)->getTable());

         dd($user);
         *
         * $user = User::update($request->all());
         *
         */
        return User::get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SignupRequest $request)
    {

    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return $user;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        //return $request->name;

        $user->update($request->all());

        return $user;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        return $user->delete();
    }
}
